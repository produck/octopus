import * as assert from 'node:assert/strict';
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

	this
		.beforeAll(async () => {
			await brain.boot(['start']);
			await sleep(4000);
		})
		.afterAll(() => {
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
		await sleep(3000);
		assert.notEqual(tentacle.environment.config.at, 0);
		Backend.redirect = true;
		Backend.now = Date.now();
		await sleep(3000);
		assert.equal(tentacle.environment.config.at, 0);
		tentacle.halt();
		Backend.redirect = false;
	});

	it('should switch job.', function () {

	});

	it('should complete a job.', function () {

	});

	it('should finish a job in error.', function () {

	});
});
