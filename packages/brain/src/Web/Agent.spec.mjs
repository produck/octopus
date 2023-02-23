import * as assert from 'node:assert/strict';
import request from 'supertest';

import * as Octopus from '../index.mjs';

const sleep = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

describe('Web::Agent', function () {
	const backend = {
		crafts: {},
		job: [],
		tentacle: [],
	};

	const brain = Octopus.Brain({
		Craft: {
			name: 'Test',
			has: name => Object.hasOwn(backend.crafts, name),
			get: name => backend.crafts[name] || null,
			create: (data) => backend.crafts[data.name] = data,
		},
		Job: {

		},
		Tentacle: {

		},
	});

	brain.Craft('example');

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

	describe('PUT  /sync', function () {
		it('should 400 if bad sync data.', async function () {
			await client.put('/api/sync').send({}).expect(400);
		});

		it('should 403 if bad craft.', async function () {
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

		it('should visit the job of tentacle.', function () {

		});

		it('should ok.', function () {

		});
	});

	describe('GET  /job/{jobId}/source', function () {

	});

	describe('POST /job/{jobId}/target', function () {

	});

	describe('POST /job/{jobId}/error', function () {

	});
});
