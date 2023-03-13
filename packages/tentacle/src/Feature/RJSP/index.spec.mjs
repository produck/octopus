import * as assert from 'node:assert/strict';
import { webcrypto as crypto } from 'node:crypto';
import * as http from 'node:http';

import * as RJSP from './index.mjs';

const sleep = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

describe('Tentacle::Feature::RJSP::RJSPClient', function () {
	const EXAMPLE = {
		id: crypto.randomUUID(), craft: 'example', version: '0.0.0',
		ready: true, job: null,
		config: {
			at: Date.now(), interval: 1000, timeout: 5000, retry: 3,
			host: '127.0.0.1', port: 9173, redirect: false,
		},
	};

	describe('constructor()', function () {
		it('should create a client.', function () {
			new RJSP.Client();
		});
	});

	describe('#JOB', function () {
		it('should throw if bad options.job().', async function () {
			const broker = new RJSP.Client({ job: () => null });

			await assert.rejects(() => broker.getSource(), {
				name: 'Error',
				message: 'Bad host from `options.job()`, one string expected.',
			});
		});
	});

	describe('#BASE_URL', function () {
		it('should throw if bad options.host().', async function () {
			const broker = new RJSP.Client({ host: () => null });

			await assert.rejects(() => broker.sync(EXAMPLE), {
				name: 'Error',
				message: 'Bad host from `options.host()`, one string expected.',
			});
		});

		it('should throw if bad options.port().', async function () {
			const broker = new RJSP.Client({ port: () => null });

			await assert.rejects(() => broker.sync(EXAMPLE), {
				name: 'Error',
				message: 'Bad host from `options.port()`, one integer expected.',
			});
		});
	});

	describe('#FETCH_OPTIIONS', function () {
		it('should throw if bad options.timeout().', async function () {
			const broker = new RJSP.Client({ timeout: () => null });

			await assert.rejects(() => broker.getSource(), {
				name: 'Error',
				message: 'Bad timeout from `options.timeout()`, one integer expected.',
			});
		});
	});

	describe('sync()', function () {
		it('should timeout get 0x21', async function () {
			const broker = new RJSP.Client({ timeout: () => 1000 });
			const server = http.createServer(() => {}).listen(9173);

			await sleep(2000);
			assert.deepEqual(await broker.sync(EXAMPLE), { code: 0x21, body: null });
			server.close();
			await sleep(2000);
		});

		it('should be forbidden get 0x41.', async function () {
			const broker = new RJSP.Client();

			const server = http.createServer((_, res) => {
				res.statusCode = 403;
				res.end();
			}).listen(9173);

			await sleep(2000);
			assert.deepEqual(await broker.sync(EXAMPLE), { code: 0x41, body: null });
			server.close();
			await sleep(2000);
		});

		it('should get 0x20 if undefined error.', async function () {
			const broker = new RJSP.Client();

			const server = http.createServer((_, res) => {
				res.statusCode = 400;
				res.end();
			}).listen(9173);

			await sleep(2000);
			assert.deepEqual(await broker.sync(EXAMPLE), { code: 0x20, body: null });
			server.close();
			await sleep(2000);
		});

		it('should ok.', async function () {
			const broker = new RJSP.Client();

			const server = http.createServer((_, res) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.end(JSON.stringify(EXAMPLE));
			}).listen(9173);

			await sleep(2000);
			assert.deepEqual(await broker.sync(EXAMPLE), { code: 0x01, body: EXAMPLE });
			server.close();
			await sleep(2000);
		});

		it('should get 0x22 if bad sync data.', async function () {
			const broker = new RJSP.Client();

			const server = http.createServer((_, res) => {
				res.statusCode = 200;
				res.setHeader('Content-Type', 'application/json');
				res.end('{');
			}).listen(9173);

			await sleep(2000);
			assert.deepEqual(await broker.sync(EXAMPLE), { code: 0x22, body: null });
			server.close();
			await sleep(2000);
		});
	});

	describe('getSource()', function () {
		it('should timeout get 0x21', async function () {
			const broker = new RJSP.Client({ timeout: () => 1000 });
			const server = http.createServer(() => {}).listen(9173);

			await sleep(2000);
			assert.deepEqual(await broker.getSource(), { code: 0x21, body: null });
			server.close();
			await sleep(2000);
		});

		it('should get 0x11 if job is not found.', async function () {
			const broker = new RJSP.Client();

			const server = http.createServer((_, res) => {
				res.statusCode = 404;
				res.end();
			}).listen(9173);

			await sleep(2000);
			assert.deepEqual(await broker.getSource(), { code: 0x11, body: null });
			server.close();
			await sleep(2000);
		});

		it('should get 0x10 if undefined error.', async function () {
			const broker = new RJSP.Client();

			const server = http.createServer((_, res) => {
				res.statusCode = 400;
				res.end();
			}).listen(9173);

			await sleep(2000);
			assert.deepEqual(await broker.getSource(), { code: 0x10, body: null });
			server.close();
			await sleep(2000);
		});

		it('should ok.', async function () {
			const broker = new RJSP.Client();

			const server = http.createServer((_, res) => {
				res.statusCode = 200;
				res.end('{}');
			}).listen(9173);

			await sleep(2000);
			assert.deepEqual(await broker.getSource(), { code: 0x02, body: {} });
			server.close();
			await sleep(2000);
		});

		it('should get 0x12 if bad sync data.', async function () {
			const broker = new RJSP.Client();

			const server = http.createServer((_, res) => {
				res.statusCode = 200;
				res.end('{');
			}).listen(9173);

			await sleep(2000);
			assert.deepEqual(await broker.getSource(), { code: 0x12, body: null });
			server.close();
			await sleep(2000);
		});
	});

	describe('setTarget()', function () {
		it('should throw if bad data.', async function () {
			const broker = new RJSP.Client();

			await assert.rejects(() => broker.setTarget(), {
				name: 'TypeError',
				message: 'Invalid "data", one "object" expected.',
			});
		});

		it('should timeout get 0x21', async function () {
			const broker = new RJSP.Client({ timeout: () => 1000 });
			const server = http.createServer(() => {}).listen(9173);

			await sleep(2000);
			assert.deepEqual(await broker.setTarget({}), { code: 0x21, body: null });
			server.close();
			await sleep(2000);
		});

		it('should get 0x11 if job is not found.', async function () {
			const broker = new RJSP.Client();

			const server = http.createServer((_, res) => {
				res.statusCode = 404;
				res.end();
			}).listen(9173);

			await sleep(2000);
			assert.deepEqual(await broker.setTarget({}), { code: 0x11, body: null });
			server.close();
			await sleep(2000);
		});

		it('should get 0x14 if job is finished.', async function () {
			const broker = new RJSP.Client();

			const server = http.createServer((_, res) => {
				res.statusCode = 423;
				res.end();
			}).listen(9173);

			await sleep(2000);
			assert.deepEqual(await broker.setTarget({}), { code: 0x14, body: null });
			server.close();
			await sleep(2000);
		});

		it('should get 0x10 if undefined error.', async function () {
			const broker = new RJSP.Client();

			const server = http.createServer((_, res) => {
				res.statusCode = 400;
				res.end();
			}).listen(9173);

			await sleep(2000);
			assert.deepEqual(await broker.setTarget({}), { code: 0x10, body: null });
			server.close();
			await sleep(2000);
		});

		it('should ok.', async function () {
			const broker = new RJSP.Client();

			const server = http.createServer((_, res) => {
				res.statusCode = 200;
				res.end('{}');
			}).listen(9173);

			await sleep(2000);
			assert.deepEqual(await broker.setTarget({}), { code: 0x03, body: {} });
			server.close();
			await sleep(2000);
		});

		it('should get 0x13 if bad sync data.', async function () {
			const broker = new RJSP.Client();

			const server = http.createServer((_, res) => {
				res.statusCode = 200;
				res.end('{');
			}).listen(9173);

			await sleep(2000);
			assert.deepEqual(await broker.setTarget({}), { code: 0x13, body: null });
			server.close();
			await sleep(2000);
		});
	});

	describe('setError()', function () {

	});
});
