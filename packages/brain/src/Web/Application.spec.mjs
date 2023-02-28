import * as assert from 'node:assert/strict';
import * as crypto from 'node:crypto';
import request from 'supertest';

import * as Octopus from '../index.mjs';

const sleep = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

function KeyPairPem() {
	const {
		publicKey,
		privateKey,
	} = crypto.generateKeyPairSync('rsa', {
		modulusLength: 2048,
	});

	return {
		public: publicKey.export({ format: 'pem', type: 'spki' }),
		private: privateKey.export({ format: 'pem', type: 'pkcs8' }),
	};
}

describe('Web::Application', function () {
	let backend = {
		application: [],
		publicKey: [],
		product: [],
	};

	const brain = Octopus.Brain({
		Application: {
			get: id => {
				return backend.application.find(data => data.id === id) || null;
			},
		},
		PublicKey: {
			query: {
				OfOwner: ({ owner }) => {
					return backend.publicKey.filter(data => data.owner === owner);
				},
			},
		},
		Procedure: {
			create: (data) => data,
		},
		Product: {
			query: {
				OfOwner: ({ owner, started }) => {
					return backend.product.filter(data => {
						if (data.owner !== owner) {
							return false;
						}

						if (started !== null) {
							return (data.startedAt === null) === started;
						}
					});
				},
				All: ({ started }) => {
					return backend.product.filter(data => {
						if (started === null) {
							return true;
						}

						return (data.startedAt !== null) === started;
					});
				},
			},
			get: id => {
				return backend.product.find(data => data.id === id) || null;
			},
			save: (_data) => {
				const target = backend.product.find(data => data.id === _data.id);

				return Object.assign(target, _data);
			},
			create: (_data) => {
				const data = {
					..._data,
					createdAt: Date.now(),
				};

				backend.product.push(data);

				return { ...data };
			},
		},
	});

	this.beforeAll(async () => {
		await brain.boot(['start']);
		await sleep(3000);
	}).afterAll(() => {
		brain.halt();
	});

	brain.configuration.application.http.port = 8080;

	brain.Model('foo', {
		script: {
			*main() {},
		},
	});

	/**
	 * @type {import('superagent')}
	 */
	const client = request('http://127.0.0.1:8080/api');

	describe('GET  /authentication', function () {
		it('should 400 if bad credential.', async function () {
			backend = { application: [], publicKey: [] };
			await client.get('/authentication').expect(400);
		});

		it('should 408 if expired time.', async function () {
			const query = [
				`app=${crypto.webcrypto.randomUUID()}`,
				`time=${Date.now() - 120000}`,
				'sign=1234567',
			];

			backend = { application: [], publicKey: [] };
			await client.get(`/authentication?${query.join('&')}`).expect(408);
		});

		it('should 404 if application not found.', async function () {
			const query = [
				`app=${crypto.webcrypto.randomUUID()}`,
				`time=${Date.now()}`,
				'sign=1234567',
			];

			backend = { application: [], publicKey: [] };
			await client.get(`/authentication?${query.join('&')}`).expect(404);
		});

		it('should 401 if bad signature.', async function () {
			const applicationId = crypto.webcrypto.randomUUID();

			const query = [
				`app=${applicationId}`,
				`time=${Date.now()}`,
				'sign=1234567',
			];

			backend = {
				application: [
					{ id: applicationId, createdAt: Date.now() },
				],
				publicKey: [],
			};

			await client.get(`/authentication?${query.join('&')}`).expect(401);
		});

		it('should 200.', async function () {
			const applicationId = crypto.webcrypto.randomUUID();
			const pair = KeyPairPem();
			const time = String(Date.now());
			const signer = crypto.createSign('SHA256');

			signer.update(time).end();

			const query = [
				`app=${applicationId}`,
				`time=${time}`,
				`sign=${signer.sign(pair.private, 'hex')}`,
			];

			backend = {
				application: [
					{ id: applicationId, createdAt: Date.now() },
				],
				publicKey: [
					{
						id: crypto.webcrypto.randomUUID(),
						owner: applicationId,
						pem: pair.public,
						createdAt: Date.now(),
					},
				],
			};

			await client.get(`/authentication?${query.join('&')}`).expect(200);
		});
	});

	function prepare(data) {
		const applicationId = crypto.webcrypto.randomUUID();
		const pair = KeyPairPem();
		const time = String(Date.now());
		const signer = crypto.createSign('SHA256');

		signer.update(time).end();

		backend = {
			application: [
				{ id: applicationId, createdAt: Date.now() },
			],
			publicKey: [
				{
					id: crypto.webcrypto.randomUUID(),
					owner: applicationId,
					pem: pair.public,
					createdAt: Date.now(),
				},
			],
			product: [],
			...data,
		};

		return [
			`app=${applicationId}`,
			`time=${time}`,
			`sign=${signer.sign(pair.private, 'hex')}`,
		].join('&');
	}

	describe('GET  /product/{model}', function () {
		it('should 404 if bad procedure.', async function () {
			const credential = prepare();

			await client
				.get(`/product/bar?${credential}`)
				.expect(404);
		});

		it('should get a empty list of product.', async function () {
			const credential = prepare({
				product: [],
			});

			await client
				.get(`/product/foo?${credential}`)
				.expect(200, []);
		});
	});

	describe('POST /product/{model}', function () {
		it('should 429 if queue overflow.', async function () {
			const credential = prepare();

			backend.product.push({
				id: crypto.webcrypto.randomUUID(),
				owner: backend.application[0].id,
				model: 'foo',
				dump: { values: [], children: [] },
				createdAt: Date.now(),
				orderedAt: null,
				startedAt: null,
				finishedAt: null,
				status: 0,
				message: null,
				order: null,
				artifact: null,
			});

			await client
				.post(`/product/foo?${credential}`)
				.send({})
				.expect(429);
		});

		it('should create a new product.', async function () {
			const credential = prepare();

			const response = await client
				.post(`/product/foo?${credential}`)
				.send({})
				.expect(201);

			assert.ok(response.body instanceof Object);
			assert.ok(typeof response.body.createdAt === 'string');
		});
	});

	describe('GET  /product/{model}/{productId}', function () {
		it('should 404 if not found.', async function () {
			const credential = prepare();

			await client
				.get(`/product/foo/${crypto.webcrypto.randomUUID()}?${credential}`)
				.expect(404);
		});

		it('should get a existent product.', async function () {
			const credential = prepare();
			const productId = crypto.webcrypto.randomUUID();

			backend.product.push({
				id: productId,
				owner: backend.application[0].id,
				model: 'foo',
				dump: { values: [], children: [] },
				createdAt: Date.now(),
				orderedAt: null,
				startedAt: null,
				finishedAt: null,
				status: 0,
				message: null,
				order: null,
				artifact: null,
			});

			await client
				.get(`/product/foo/${productId}?${credential}`)
				.expect(200);
		});
	});

	describe('PUT  /product/{model}/{productId}/state', function () {
		it('should 400 if bad state requested.', async function () {
			const credential = prepare();
			const productId = crypto.webcrypto.randomUUID();

			backend.product.push({
				id: productId,
				owner: backend.application[0].id,
				model: 'foo',
				dump: { values: [], children: [] },
				createdAt: Date.now(),
				orderedAt: null,
				startedAt: null,
				finishedAt: null,
				status: 0,
				message: null,
				order: null,
				artifact: null,
			});

			await client
				.put(`/product/foo/${productId}/state?${credential}`)
				.send({})
				.expect(400);
		});

		it('should 403 if product is finished.', async function () {
			const credential = prepare();
			const productId = crypto.webcrypto.randomUUID();

			backend.product.push({
				id: productId,
				owner: backend.application[0].id,
				model: 'foo',
				dump: { values: [], children: [] },
				createdAt: Date.now(),
				orderedAt: null,
				startedAt: null,
				finishedAt: Date.now() + 5000,
				status: 100,
				message: null,
				order: null,
				artifact: null,
			});

			await client
				.put(`/product/foo/${productId}/state?${credential}`)
				.send({ finished: true })
				.expect(403);
		});

		it('should finish a proudct.', async function () {
			const credential = prepare();
			const productId = crypto.webcrypto.randomUUID();

			backend.product.push({
				id: productId,
				owner: backend.application[0].id,
				model: 'foo',
				dump: { values: [], children: [] },
				createdAt: Date.now(),
				orderedAt: null,
				startedAt: null,
				finishedAt: null,
				status: 0,
				message: null,
				order: null,
				artifact: null,
			});

			await client
				.put(`/product/foo/${productId}/state?${credential}`)
				.send({ finished: true })
				.expect(200);
		});
	});

	describe('POST /product/{model}/{productId}/order', function () {
		it('should 403 if product is ordered.', function () {

		});

		it('should 403 if product is finished.', function () {

		});

		it('should 400 if bad order data.', function () {

		});

		it('should set order of a product.', function () {

		});
	});

	describe('GET /product/{model}/{productId}/order', function () {
		it('should 404 if product is not ordered.', function () {

		});

		it('should get product order.', function () {

		});
	});

	describe('GET /product/{model}/{productId}/job', function () {
		it('should get a job list.', function () {

		});
	});

	describe('GET /product/{model}/{productId}/job/{jobId}', function () {
		it('should 404 if job not found.', function () {

		});

		it('should 404 if job does not belong to product.', function () {

		});

		it('should get a job.', function () {

		});
	});

	describe('GET /product/{model}/{productId}/artifact', function () {
		it('should 404 if unfinished.', function () {

		});

		it('should 404 if failed.', function () {

		});
	});
});
