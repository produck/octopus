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

	let code = 200, data = '', block = false;

	const reset = () => {
		code = 200, data = '', block = false;
	};

	const server = http.createServer((_, res) => {
		if (block) {
			return setTimeout(() => res.end(), 10000);
		}

		res.statusCode = code;

		if (code > 200 && code < 300) {
			res.setHeader('Content-Type', 'application/json');
		}

		res.end(data);
	});

	this
		.beforeEach(reset)
		.beforeAll(() => server.listen(9173, '127.0.0.1'))
		.afterAll(async () => {
			server.close();
			await sleep(3000);
		});

	describe('constructor()', function () {
		it('should create a client.', function () {
			new RJSP.Client();
		});
	});

	describe('#JOB', function () {
		it('should throw if bad options.job().', async function () {
			const client = new RJSP.Client({ job: () => null });

			await assert.rejects(() => client.getSource(), {
				name: 'Error',
				message: 'Bad host from `options.job()`, one string expected.',
			});
		});
	});

	describe('#BASE_URL', function () {
		it('should throw if bad options.host().', async function () {
			const client = new RJSP.Client({ host: () => null });

			await assert.rejects(() => client.sync(EXAMPLE), {
				name: 'Error',
				message: 'Bad host from `options.host()`, one string expected.',
			});
		});

		it('should throw if bad options.port().', async function () {
			const client = new RJSP.Client({ port: () => null });

			await assert.rejects(() => client.sync(EXAMPLE), {
				name: 'Error',
				message: 'Bad host from `options.port()`, one integer expected.',
			});
		});
	});

	describe('#FETCH_OPTIIONS', function () {
		it('should throw if bad options.timeout().', async function () {
			const client = new RJSP.Client({ timeout: () => null });

			await assert.rejects(() => client.getSource(), {
				name: 'Error',
				message: 'Bad timeout from `options.timeout()`, one integer expected.',
			});
		});
	});

	describe('sync()', function () {
		it('should timeout get 0x21', async function () {
			const client = new RJSP.Client({ timeout: () => 1000 });

			block = true;
			assert.deepEqual(await client.sync(EXAMPLE), { code: 0x21, body: null });
		});

		it('should be forbidden get 0x41.', async function () {
			const client = new RJSP.Client();

			code = 403;
			assert.deepEqual(await client.sync(EXAMPLE), { code: 0x41, body: null });
		});

		it('should get 0x20 if undefined error.', async function () {
			const client = new RJSP.Client();

			code = 400;
			assert.deepEqual(await client.sync(EXAMPLE), { code: 0x20, body: null });
		});

		it('should ok.', async function () {
			const client = new RJSP.Client();

			code = 200, data = JSON.stringify(EXAMPLE);
			assert.deepEqual(await client.sync(EXAMPLE), { code: 0x01, body: EXAMPLE });
		});

		it('should get 0x22 if bad sync data.', async function () {
			const client = new RJSP.Client();

			code = 200, data = '{';
			assert.deepEqual(await client.sync(EXAMPLE), { code: 0x22, body: null });
		});
	});

	describe('getSource()', function () {
		it('should timeout get 0x21', async function () {
			const client = new RJSP.Client({ timeout: () => 1000 });

			block = true;
			assert.deepEqual(await client.getSource(), { code: 0x21, body: null });
		});

		it('should get 0x11 if job is not found.', async function () {
			const client = new RJSP.Client();

			code = 404;
			assert.deepEqual(await client.getSource(), { code: 0x11, body: null });
		});

		it('should get 0x10 if undefined error.', async function () {
			const client = new RJSP.Client();

			code = 400;
			assert.deepEqual(await client.getSource(), { code: 0x10, body: null });
		});

		it('should ok.', async function () {
			const client = new RJSP.Client();

			data = '{}';
			assert.deepEqual(await client.getSource(), { code: 0x02, body: {} });
		});

		it('should get 0x12 if bad sync data.', async function () {
			const client = new RJSP.Client();

			data = '{';
			assert.deepEqual(await client.getSource(), { code: 0x12, body: null });
		});
	});

	describe('setTarget()', function () {
		it('should throw if bad data.', async function () {
			const client = new RJSP.Client();

			await assert.rejects(() => client.setTarget(), {
				name: 'TypeError',
				message: 'Invalid "data", one "object" expected.',
			});
		});

		it('should timeout get 0x21', async function () {
			const client = new RJSP.Client({ timeout: () => 1000 });

			block = true;
			assert.deepEqual(await client.setTarget({}), { code: 0x21, body: null });
		});

		it('should get 0x11 if job is not found.', async function () {
			const client = new RJSP.Client();

			code = 404;
			assert.deepEqual(await client.setTarget({}), { code: 0x11, body: null });
		});

		it('should get 0x14 if job is finished.', async function () {
			const client = new RJSP.Client();

			code = 423;
			assert.deepEqual(await client.setTarget({}), { code: 0x14, body: null });
		});

		it('should get 0x10 if undefined error.', async function () {
			const client = new RJSP.Client();

			code = 401;
			assert.deepEqual(await client.setTarget({}), { code: 0x10, body: null });
		});

		it('should ok.', async function () {
			const client = new RJSP.Client();

			data = '{}';
			assert.deepEqual(await client.setTarget({}), { code: 0x03, body: {} });
		});

		it('should get 0x13 if bad incoming target.', async function () {
			const client = new RJSP.Client();

			data = '{';
			assert.deepEqual(await client.setTarget({}), { code: 0x13, body: null });
		});

		it('should get 0x13 if bad outgoing target.', async function () {
			const client = new RJSP.Client();

			code = 400;
			assert.deepEqual(await client.setTarget({}), { code: 0x14, body: null });
		});
	});

	describe('setError()', function () {
		it('should throw if bad data.', async function () {
			const client = new RJSP.Client();

			await assert.rejects(() => client.setError(1), {
				name: 'TypeError',
				message: 'Invalid "message", one "string or null" expected.',
			});
		});

		it('should timeout get 0x21', async function () {
			const client = new RJSP.Client({ timeout: () => 1000 });

			block = true;
			assert.deepEqual(await client.setError(), { code: 0x21, body: null });
		});

		it('should get 0x11 if job is not found.', async function () {
			const client = new RJSP.Client();

			code = 404;
			assert.deepEqual(await client.setError(), { code: 0x11, body: null });
		});

		it('should get 0x14 if job is finished.', async function () {
			const client = new RJSP.Client();

			code = 423;
			assert.deepEqual(await client.setError(), { code: 0x14, body: null });
		});

		it('should get 0x10 if undefined error.', async function () {
			const client = new RJSP.Client();

			code = 401;
			assert.deepEqual(await client.setError(), { code: 0x10, body: null });
		});

		it('should ok.', async function () {
			const client = new RJSP.Client();

			data = '{ "message": null }';

			assert.deepEqual(await client.setError(), {
				code: 0x04,
				body: { message: null },
			});
		});

		it('should get 0x14 if bad sync data.', async function () {
			const client = new RJSP.Client();

			data = '{';
			assert.deepEqual(await client.setError(), { code: 0x14, body: null });
		});
	});
});
