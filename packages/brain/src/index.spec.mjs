import * as assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { describe, it } from 'mocha';

import * as Octopus from './index.mjs';

const sleep = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

describe('OctopusBrain()', function () {
	it('should create a OctopusBrain.', function () {
		Octopus.Brain();
	});

	it('should throw if bad options.web.external.', function () {
		assert.throws(() => {
			Octopus.Brain({
				web: {
					external: () => {},
				},
			});
		}, {
			name: 'TypeError',
			message: 'Invalid "middleware <= Options.web.external()", one "function" expected.',
		});
	});

	describe('.Model()', function () {
		it('should register a new model.', function () {
			const TestBrain = Octopus.Brain();

			TestBrain.Model('foo');
		});
	});

	describe('.Craft()', function () {
		it('should register a new craft.', function () {
			const TestBrain = Octopus.Brain();

			TestBrain.Craft('foo');
		});
	});

	describe('.halt()', function () {
		it('should be halted.', async function () {
			const TestBrain = Octopus.Brain();

			await TestBrain.halt();
		});
	});

	describe('.boot()', function () {
		describe('>install', function () {
			it('should be install', async function () {
				const brain = Octopus.Brain();
				const targetPath = path.resolve('.data');

				await brain.boot(['install']);
				await fs.access(targetPath);
				await fs.rm(targetPath, { recursive: true });
			});
		});

		describe('>start <HTTP>', function () {
			it('should be booted in SOLO/HTTP.', async function () {
				const brain = Octopus.Brain();

				await brain.boot(['start']);
				await sleep();
				brain.halt();
			});
		});

		describe('>start <HTTPS>', function () {
			let brain = Octopus.Brain();
			const targetPath = path.resolve('.data');

			this.beforeEach(async () => {
				brain = Octopus.Brain();
				await brain.boot(['install']);

				await fs.cp(
					path.resolve('assets/tls'),
					path.resolve('.data/tls'),
					{ force: true, recursive: true },
				);
			}).afterEach(async () => {
				await sleep();
				brain.halt();
				await fs.rm(targetPath, { recursive: true });
				brain = null;
			});

			it('should be booted in SOLO/HTTPS', async function () {
				brain.configuration.application.mode = 'HTTPS';
				await brain.boot(['start']);
			});

			it('should be booted in SOLO/REDIRECT', async function () {
				brain.configuration.application.mode = 'REDIRECT';
				await brain.boot(['start']);
			});

			it('should be booted in SOLO/BOTH', async function () {
				brain.configuration.application.mode = 'BOTH';
				await brain.boot(['start']);
			});

			it('should throw if no tls in SOLO/HTTPS.', async function () {
				brain.configuration.application.mode = 'HTTPS';
				brain.configuration.application.https.key = 'foo.pem';

				await assert.rejects(async () => brain.boot(['start']), {
					name: 'Error',
					message: /^Can NOT found "key.pem" in /,
				});
			});

			it('should throw if no tls in SOLO/HTTPS.', async function () {
				brain.configuration.application.mode = 'HTTPS';
				brain.configuration.application.https.cert = 'foo.pem';

				await assert.rejects(async () => brain.boot(['start']), {
					name: 'Error',
					message: /^Can NOT found "cert.pem" in /,
				});
			});
		});
	});
});
