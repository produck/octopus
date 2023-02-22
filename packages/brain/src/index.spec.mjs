import * as assert from 'node:assert/strict';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { describe, it } from 'mocha';

import * as Octopus from './index.mjs';

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

describe('OctopusBrain()', function () {
	it('should create a OctopusBrain.', function () {
		Octopus.Brain();
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
				await sleep(3000);
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
				await brain.boot(['start']);
				await sleep(3000);
				brain.halt();
				await fs.rm(targetPath, { recursive: true });
				brain = null;
			});

			it('should be booted in SOLO/HTTPS', async function () {
				brain.configuration.application.mode = 'HTTPS';
			});

			it('should be booted in SOLO/REDIRECT', async function () {
				brain.configuration.application.mode = 'REDIRECT';
			});

			it('should be booted in SOLO/BOTH', async function () {
				brain.configuration.application.mode = 'BOTH';
			});
		});
	});
});
