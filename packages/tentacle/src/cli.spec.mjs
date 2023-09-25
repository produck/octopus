import * as assert from 'node:assert/strict';
import * as Octopus from './index.mjs';

const sleep = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

describe('CLI', function () {
	describe('> dev', async function () {
		const _exit = process.exit;

		this
			.beforeAll(() => process.exit = () => {})
			.afterAll(() => process.exit = _exit);

		it('should press these keys.', async function () {
			const tentacle = Octopus.Tentacle({
				craft: 'example',
				version: '0.0.0',
				shared: () => ({}),
				run: (work) => work.complete('foo'),
				abort: () => {},
			});

			tentacle.boot(['dev']);
			await sleep();
			process.stdin.emit('keypress', null, { shift: true, name: 'e' });
			await sleep();
			process.stdin.emit('keypress', null, { shift: true, name: 'r' });
			await sleep();
			process.stdin.emit('keypress', null, { shift: true, name: 's' });
			await sleep();
			process.stdin.emit('keypress', null, { shift: true, name: 's' });
			await sleep();
			process.stdin.emit('keypress', null, { shift: true, name: 'v' });
			await sleep();
			process.stdin.emit('keypress', null, { shift: true, name: 'c' });
		});

		it('should not ready when aborting.', async function () {
			const tentacle = Octopus.Tentacle({
				craft: 'example',
				version: '0.0.0',
				shared: () => ({}),
				run: () => {},
			});

			process.exit = () => {};
			tentacle.boot(['dev']);

			await sleep();
			process.stdin.emit('keypress', null, { shift: true, name: 'r' });
			await sleep();
			process.stdin.emit('keypress', null, { shift: true, name: 's' });
			await sleep();
			process.stdin.emit('keypress', null, { shift: true, name: 's' });
			await sleep();
			process.stdin.emit('keypress', null, { shift: true, name: 'c' });
		});

		it('should busy when running.', async function () {
			const tentacle = Octopus.Tentacle({
				craft: 'example',
				version: '0.0.0',
				shared: () => ({}),
				run: () => {},
			});

			process.exit = () => {};
			tentacle.boot(['dev']);

			await sleep();
			process.stdin.emit('keypress', null, { shift: true, name: 'r' });
			await sleep();
			process.stdin.emit('keypress', null, { shift: true, name: 'r' });
			await sleep();
			process.stdin.emit('keypress', null, { shift: true, name: 'c' });
		});
	});

	describe('> clean', function () {
		it('should run options.command.clean.', async function () {
			let flag = false;

			const tentacle = Octopus.Tentacle({
				craft: 'example',
				version: '0.0.0',
				shared: () => ({}),
				run: () => {},
				command: {
					options: {
						start: [{
							name: 'foo', required: false, value: null,
							description: 'for test.',
						}],
					},
					clean: () => {
						flag = true;
					},
				},
			});

			await tentacle.boot(['clean']);
			assert.equal(flag, true);
		});
	});

	it('should start.', async function () {
		const tentacle = Octopus.Tentacle({
			craft: 'example',
			version: '0.0.0',
			shared: () => ({}),
			run: () => {},
		});

		await tentacle.boot(['-m', 'solo']);
		await sleep();
		tentacle.halt();

		await tentacle.boot(['-m', 'solo']);
		await sleep();
		tentacle.halt();
	});
});
