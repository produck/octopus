import { Brain } from '@produck/octopus-brain';
import * as Octopus from './index.mjs';

const sleep = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

describe('OctopusTentacle', function () {
	it('should create a tentacle.', function () {
		Octopus.Tentacle();
	});

	it('should be booted & halt.', async function () {
		const tentacle = Octopus.Tentacle();

		await tentacle.boot(['-m', 'solo']);
		await sleep(10000);
		tentacle.halt();
	});

	it('should sync ok then halt.', async function () {
		await sleep(4000);

		const tentacle = Octopus.Tentacle();
		const brain = Brain();

		brain.Craft('example');

		await brain.boot(['start']);
		await tentacle.boot(['-m', 'solo']);

		await sleep(10000);

		tentacle.halt();
		brain.halt();
	});

	it('should sync failed by undefined craft.', async function () {
		await sleep(4000);

		const tentacle = Octopus.Tentacle({ craft: 'foo' });
		const brain = Brain();

		brain.Craft('example');

		await brain.boot(['start']);
		await tentacle.boot(['-m', 'solo']);

		await sleep(10000);

		tentacle.halt();
		brain.halt();
	});
});
