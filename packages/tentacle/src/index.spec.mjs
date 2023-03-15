import * as assert from 'node:assert/strict';
import * as http from 'node:http';
import { webcrypto as crypto } from 'node:crypto';
import { Brain, Environment } from '@produck/octopus-brain';
import * as Octopus from './index.mjs';

const sleep = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

describe('OctopusTentacle', function () {
	it('should create a tentacle.', function () {
		Octopus.Tentacle();
	});

	it('should be booted & halt.', async function () {
		const tentacle = Octopus.Tentacle();

		await tentacle.boot(['-m', 'solo']);
		await sleep(5000);
		tentacle.halt();
	});

	describe('About sync', function () {
		const Backend = {
			redirect: false,
			now: Date.now(),
			environment: Environment.Property.normalize(),
		};

		const brain = Brain({
			Environment: {
				fetch: () => ({
					...Backend.environment,
					'ENVIRONMENT.AT': Backend.now,
					'RJSP.REDIRECT.ENABLED': Backend.redirect,
				}),
			},
		});

		brain.Craft('example');

		this.beforeAll(async () => {
			await brain.boot(['start']);
			await sleep(4000);
		}).afterAll(() => {
			console.log(111111);
			brain.halt();
		});

		it('should sync ok then halt.', async function () {
			const tentacle = Octopus.Tentacle();

			await tentacle.boot(['-m', 'solo']);
			await sleep(5000);
			tentacle.halt();
		});

		it('should sync failed then halt on retrying.', async function () {
			const tentacle = Octopus.Tentacle();

			tentacle.environment.config.port = 9174;
			await tentacle.boot(['-m', 'solo']);
			await sleep(5000);
			tentacle.halt();
		});

		it('should sync failed by undefined craft.', async function () {
			const tentacle = Octopus.Tentacle({ craft: 'foo' });

			await tentacle.boot(['-m', 'solo']);
			await sleep(5000);
			tentacle.halt();
		});

		it('should redirect and reset config.', async function () {
			const tentacle = Octopus.Tentacle();

			await tentacle.boot(['-m', 'solo']);
			await sleep(5000);
			assert.notEqual(tentacle.environment.config.at, 0);
			Backend.redirect = true;
			Backend.now = Date.now();
			await sleep(5000);
			assert.equal(tentacle.environment.config.at, 0);
			tentacle.halt();
			Backend.redirect = false;
		});
	});

	describe('About Job', function () {
		const EXAMPLE = {
			id: crypto.randomUUID(), craft: 'example', version: '0.0.0',
			ready: true, job: null,
			config: {
				at: Date.now(), interval: 1000, timeout: 5000, retry: 3,
				host: '127.0.0.1', port: 9173, redirect: false,
			},
		};

		let job;

		const SOURCE_REG = /\/api\/[\w\d-]+\/source/;

		const server = http.createServer((req, res) => {
			res.statusCode = 200;

			if (req.url === '/api/sync') {
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify({ ...EXAMPLE, job }));
			} else if (SOURCE_REG.test(req.url)) {
				res.end(JSON.stringify({}));
			} else {
				res.socket.destroy();
			}
		});

		this.beforeAll(() => {
			server.listen(9174, '127.0.0.1');
		}).afterAll(async () => {
			server.close();
			await sleep(3000);
		});

		it('should switch job to complete.', async function () {
			const tentacle = Octopus.Tentacle({
				craft: 'example',
				version: '0.0.0',
				shared: () => ({}),
				run: (work) => work.complete({ foo: 'bar' }),
				abort: () => {},
			});

			tentacle.environment.config.port = 9174;
			await tentacle.boot(['-m', 'solo']);
			job = crypto.randomUUID();
			await sleep(3000);
			job = crypto.randomUUID();
			await sleep(3000);
			tentacle.halt();
		});

		it('should switch job to throw.', async function () {
			const tentacle = Octopus.Tentacle({
				craft: 'example',
				version: '0.0.0',
				shared: () => ({}),
				run: (work) => work.throw(),
				abort: () => {},
			});

			tentacle.environment.config.port = 9174;
			await tentacle.boot(['-m', 'solo']);
			job = crypto.randomUUID();
			await sleep(3000);
			job = crypto.randomUUID();
			await sleep(3000);
			tentacle.halt();
		});

		it('should switch job and free old job.', async function () {
			const tentacle = Octopus.Tentacle({
				craft: 'example',
				version: '0.0.0',
				shared: () => ({}),
				run: () => {},
				abort: () => {},
			});

			tentacle.environment.config.port = 9174;
			await tentacle.boot(['-m', 'solo']);
			job = crypto.randomUUID();
			await sleep(2000);
			job = crypto.randomUUID();
			await sleep(2000);
			tentacle.halt();
		});
	});
});
