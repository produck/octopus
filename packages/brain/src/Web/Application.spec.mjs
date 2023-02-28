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
	});

	this.beforeAll(async () => {
		await brain.boot(['start']);
		await sleep(3000);
	}).afterAll(() => {
		brain.halt();
	});

	brain.configuration.application.http.port = 8080;

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

	describe('GET  /product/{model}', function () {
		it('should 400 if bad procedure.', function () {

		});

		it('should get a list of product.', function () {

		});
	});

	describe('POST /product/{model}', function () {
		it('should 429 if queue overflow.', function () {

		});

		it('should create a new product.', function () {

		});
	});

	describe('GET  /product/{model}/{productId}', function () {
		it('should 404 if not found.', function () {

		});

		it('should get a existent product.', function () {

		});
	});

	describe('PUT  /product/{model}/{productId}/state', function () {
		it('should 403 if product is finished.', function () {

		});

		it('should finish a proudct.', function () {

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
