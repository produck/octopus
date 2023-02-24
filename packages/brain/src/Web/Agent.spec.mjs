import * as assert from 'node:assert/strict';
import { webcrypto as crypto } from 'node:crypto';
import request from 'supertest';

import * as Octopus from '../index.mjs';

const sleep = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

describe('Web::Agent', function () {
	let backend = {
		crafts: {},
		job: [],
		tentacles: [
			{
				id: crypto.randomUUID(),
				craft: 'example2',
				version: '1.0.0',
				ready: true,
				job: null,
				createdAt: Date.now() - 5000,
				visitedAt: Date.now(),
			},
		],
	};

	const brain = Octopus.Brain({
		Craft: {
			name: 'Test',
			has: name => Object.hasOwn(backend.crafts, name),
			get: name => backend.crafts[name] || null,
			create: (data) => backend.crafts[data.name] = data,
		},
		Job: {
			get: () => backend.job[0],
			save: (data) => {
				backend.job[0].visitedAt = Date.now();
				backend.job[0].target = data.target;
				backend.job[0].status = data.status;
				backend.job[0].message = data.message;

				return backend.job[0];
			},
		},
		Tentacle: {
			has: () => true,
			get: () => backend.tentacles[0],
			save: () => {
				backend.tentacles[0].visitedAt = Date.now();

				return backend.tentacles[0];
			},
		},
	});

	brain.Craft('example2', {
		target: any => {
			return any.a !== null;
		},
	});

	/**
	 * @type {ReturnType<import('superagent')>}
	 */
	const client = request('http://127.0.0.1:9173');

	this.beforeAll(async () => {
		await brain.boot(['start']);
		await sleep(3000);
	}).afterAll(() => {
		brain.halt();
	});

	describe('PUT  /api/sync', function () {
		it('should 400 if bad sync data.', async function () {
			backend = { crafts: {}, job: [], tentacles: [] };
			await client.put('/api/sync').send({}).expect(400);
		});

		it('should 403 if bad craft.', async function () {
			backend = { crafts: {}, job: [], tentacles: [] };

			await client.put('/api/sync').send({
				id: '',
				craft: 'foo',
				version: '0.0.0',
				ready: true,
				job: null,
				config: {
					at: Date.now(),
					interval: 1000,
					timeout: 10000,
					host: '127.0.0.1',
					port: 9173,
					redirect: false,
				},
			}).expect(403);
		});

		it('should visit the tentacle without job.', async function () {
			backend = {
				crafts: {}, job: [],
				tentacles: [
					{
						id: crypto.randomUUID(),
						craft: 'example2',
						version: '1.0.0',
						ready: true,
						job: null,
						createdAt: Date.now() - 5000,
						visitedAt: Date.now(),
					},
				],
			};

			const oldVisitedAt = backend.tentacles[0].visitedAt;

			await sleep();

			await client.put('/api/sync').send({
				id: backend.tentacles[0].id,
				craft: 'example2',
				version: '0.0.0',
				ready: true,
				job: null,
				config: {
					at: Date.now(),
					interval: 1000,
					timeout: 10000,
					host: '127.0.0.1',
					port: 9173,
					redirect: false,
				},
			}).expect(200);

			assert.ok(backend.tentacles[0].visitedAt > oldVisitedAt);
		});

		it('should visit the job of tentacle.', async function () {
			const jobId = crypto.randomUUID();

			backend = {
				crafts: {},
				job: [
					{
						id: jobId,
						product: crypto.randomUUID(),
						craft: 'example2',
						createdAt: Date.now() - 5000,
						visitedAt: Date.now(),
						startedAt: Date.now(),
						finishedAt: null,
						message: null,
						source: {},
						target: {},
					},
				],
				tentacles: [
					{
						id: crypto.randomUUID(),
						craft: 'example2',
						version: '1.0.0',
						ready: true,
						job: jobId,
						createdAt: Date.now() - 5000,
						visitedAt: Date.now(),
					},
				],
			};

			const oldVisitedAt = backend.job[0].visitedAt;

			await client.put('/api/sync').send({
				id: backend.tentacles[0].id,
				craft: 'example2',
				version: '0.0.0',
				ready: true,
				job: null,
				config: {
					at: Date.now(),
					interval: 1000,
					timeout: 10000,
					host: '127.0.0.1',
					port: 9173,
					redirect: false,
				},
			}).expect(200);

			await sleep();

			assert.ok(backend.job[0].visitedAt > oldVisitedAt);
		});
	});

	describe('GET  /api/job/{jobId}/source', function () {
		it('should 404 if job not found.', async function () {
			backend = { crafts: {}, tentacles: [], job: [null] };

			await client
				.get(`/api/job/${crypto.randomUUID()}/source`)
				.expect(404);
		});

		it('should gat source.', async function () {
			backend = {
				crafts: {}, tentacles: [],
				job: [
					{
						id: crypto.randomUUID(),
						product: crypto.randomUUID(),
						craft: 'example2',
						createdAt: Date.now() - 5000,
						visitedAt: Date.now(),
						startedAt: Date.now(),
						finishedAt: null,
						message: null,
						source: { foo: 'bar' },
						target: {},
					},
				],
			};

			await client
				.get(`/api/job/${crypto.randomUUID()}/source`)
				.expect(200, { foo: 'bar' });
		});
	});

	describe('POST /api/job/{jobId}/target', function () {
		it('should 404 if job not found.', async function () {
			backend = { crafts: {}, tentacles: [], job: [null] };

			await client
				.post(`/api/job/${crypto.randomUUID()}/target`)
				.send({ foo: 'bar' })
				.expect(404);
		});

		it('should 423 if job is finished.', async function () {
			backend = {
				crafts: {}, tentacles: [],
				job: [
					{
						id: crypto.randomUUID(),
						product: crypto.randomUUID(),
						craft: 'example2',
						createdAt: Date.now() - 5000,
						visitedAt: Date.now(),
						startedAt: Date.now(),
						finishedAt: Date.now(),
						status: 100,
						message: null,
						source: { foo: 'bar' },
						target: {},
					},
				],
			};

			await client
				.post(`/api/job/${crypto.randomUUID()}/target`)
				.send({ foo: 'bar' })
				.expect(423);
		});

		it('should 400 if bad target.', async function () {
			backend = {
				crafts: {}, tentacles: [],
				job: [
					{
						id: crypto.randomUUID(),
						product: crypto.randomUUID(),
						craft: 'example2',
						createdAt: Date.now() - 5000,
						visitedAt: Date.now(),
						startedAt: Date.now(),
						finishedAt: null,
						status: 0,
						message: null,
						source: { foo: 'bar' },
						target: null,
					},
				],
			};

			await client
				.post(`/api/job/${crypto.randomUUID()}/target`)
				.send({ a: null })
				.expect(400);
		});

		it('should set target.', async function () {
			backend = {
				crafts: {}, tentacles: [],
				job: [
					{
						id: crypto.randomUUID(),
						product: crypto.randomUUID(),
						craft: 'example2',
						createdAt: Date.now() - 5000,
						visitedAt: Date.now(),
						startedAt: Date.now(),
						finishedAt: null,
						status: 0,
						message: null,
						source: { foo: 'bar' },
						target: null,
					},
				],
			};

			await client
				.post(`/api/job/${crypto.randomUUID()}/target`)
				.send({ foo: 'bar' })
				.expect(200, { foo: 'bar' });

			assert.equal(backend.job[0].status, 100);
		});
	});

	describe('POST /api/job/{jobId}/error', function () {
		it('should 404 if job not found.', async function () {
			backend = { crafts: {}, tentacles: [], job: [null] };

			await client
				.post(`/api/job/${crypto.randomUUID()}/error`)
				.send('foo')
				.expect(404);
		});

		it('should 423 if job is finished.', async function () {
			backend = {
				crafts: {}, tentacles: [],
				job: [
					{
						id: crypto.randomUUID(),
						product: crypto.randomUUID(),
						craft: 'example2',
						createdAt: Date.now() - 5000,
						visitedAt: Date.now(),
						startedAt: Date.now(),
						finishedAt: Date.now(),
						status: 100,
						message: null,
						source: { foo: 'bar' },
						target: {},
					},
				],
			};

			await client
				.post(`/api/job/${crypto.randomUUID()}/error`)
				.send({ foo: 'bar' })
				.expect(423);
		});

		it('should set object error.', async function () {
			backend = {
				crafts: {}, tentacles: [],
				job: [
					{
						id: crypto.randomUUID(),
						product: crypto.randomUUID(),
						craft: 'example2',
						createdAt: Date.now() - 5000,
						visitedAt: Date.now(),
						startedAt: Date.now(),
						finishedAt: null,
						status: 0,
						message: null,
						source: { foo: 'bar' },
						target: null,
					},
				],
			};

			await client
				.post(`/api/job/${crypto.randomUUID()}/error`)
				.send({ foo: 'bar' })
				.expect(200, { foo: 'bar' });

			assert.equal(backend.job[0].status, 200);
			assert.equal(backend.job[0].message, '{"foo":"bar"}');
		});

		it('should set string error.', async function () {
			backend = {
				crafts: {}, tentacles: [],
				job: [
					{
						id: crypto.randomUUID(),
						product: crypto.randomUUID(),
						craft: 'example2',
						createdAt: Date.now() - 5000,
						visitedAt: Date.now(),
						startedAt: Date.now(),
						finishedAt: null,
						status: 0,
						message: null,
						source: { foo: 'bar' },
						target: null,
					},
				],
			};

			await client
				.post(`/api/job/${crypto.randomUUID()}/error`)
				.type('text')
				.send('foo')
				.expect(200, 'foo');

			assert.equal(backend.job[0].status, 200);
			assert.equal(backend.job[0].message, 'foo');
		});
	});
});
