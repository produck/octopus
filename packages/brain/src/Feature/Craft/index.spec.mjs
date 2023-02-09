import * as assert from 'node:assert/strict';
import { describe, it } from 'mocha';

import { defineCraft, Data } from './index.mjs';

describe('::Feature::Craft', function () {
	describe('::defineCraft()', function () {
		const NativeCraft = defineCraft();

		assert.equal(NativeCraft.name, 'NativeCraftProxy');
	});

	describe('::NativeCraft', function () {
		const EXAMPLE = Data.normalize({ name: 'example' });

		describe('::has()', function () {
			for (const value of [true, false]) {
				it(`should get ${value}.`, async function () {
					const NativeCraft = defineCraft({
						has: () => value,
					});

					assert.equal(await NativeCraft.has('foo'), value);
				});
			}
		});

		describe('::get()', function () {
			it('should get a craft.', async function () {
				const NativeCraft = defineCraft({
					has: () => true,
					get: () => ({ ...EXAMPLE }),
				});

				const craft = await NativeCraft.get('example');

				assert.equal(craft.name, EXAMPLE.name);
			});

			it('should throw if bad name.', async function () {
				const NativeCraft = defineCraft({
					has: () => false,
				});

				await assert.rejects(async () => await NativeCraft.get(1), {
					name: 'TypeError',
					message: 'Invalid "name", one "string" expected.',
				});
			});

			it('should throw if undefined craft.', async function () {
				const NativeCraft = defineCraft({
					has: () => false,
				});

				await assert.rejects(async () => await NativeCraft.get('example'), {
					name: 'Error',
					message: 'Undefined craft(example).',
				});
			});

			it('should throw if data === null', async function () {
				const NativeCraft = defineCraft({
					has: () => true,
					get: () => null,
				});

				await assert.rejects(async () => await NativeCraft.get('example'), {
					name: 'Error',
					message: 'There MUST be a craft named "example".',
				});
			});
		});

		describe('::create()', function () {
			it('should create a craft.', async function () {
				const NativeCraft = defineCraft({
					has: () => false,
					get: () => EXAMPLE,
					create: () => EXAMPLE,
				});

				const { name, ...options } = EXAMPLE;
				const craft = await NativeCraft.create(name, options);

				assert.equal(craft.name, EXAMPLE.name);
			});

			it('should throw if duplicated.', async function () {
				const NativeCraft = defineCraft({
					has: () => true,
					get: () => EXAMPLE,
				});

				const { name, ...options } = EXAMPLE;

				await assert.rejects(async () => await NativeCraft.create(name, options), {
					name: 'Error',
					message: 'Duplicated craft name(example).',
				});
			});
		});

		describe('::{on, off, once}()', function () {
			for (const methodName of ['on', 'off', 'once']) {
				it(`shoudl call .${methodName}().`, function () {
					const NativeCraft = defineCraft();

					NativeCraft[methodName]('foo', () => {});
				});
			}
		});

		describe('::register()', function () {
			it('should register a craft.', async function () {
				const NativeCraft = defineCraft({
					has: () => false,
					get: () => EXAMPLE,
					create: () => EXAMPLE,
				});

				const { name, ...options } = EXAMPLE;
				const craft = await NativeCraft.register(name, options);

				assert.equal(craft.name, EXAMPLE.name);
			});
		});

		describe('::isValid()', function () {
			it('should be true.', async function () {
				const NativeCraft = defineCraft({
					has: () => false,
					get: () => EXAMPLE,
					create: () => EXAMPLE,
				});

				const { name, ...options } = EXAMPLE;

				await NativeCraft.register(name, options);

				assert.equal(NativeCraft.isValid(name), true);
			});
		});

		describe('::assertValid()', function () {
			it('should throw if bad name.', async function () {
				const NativeCraft = defineCraft({
					has: () => false,
					get: () => EXAMPLE,
					create: () => EXAMPLE,
				});

				assert.throws(() => NativeCraft.assertValid('foo'), {
					name: 'Error',
					message: 'There is no craft(foo).',
				});
			});
		});

		describe('::isCraftSource()', function () {
			it('should be true.', async function () {
				const NativeCraft = defineCraft({
					has: () => false,
					get: () => EXAMPLE,
					create: () => EXAMPLE,
				});

				const { name, ...options } = EXAMPLE;

				await NativeCraft.register(name, options);
				assert.equal(NativeCraft.isCraftSource('example', ''), true);
			});
		});

		describe('::isCraftTarget()', function () {
			it('should be true.', async function () {
				const NativeCraft = defineCraft({
					has: () => false,
					get: () => EXAMPLE,
					create: () => EXAMPLE,
				});

				const { name, ...options } = EXAMPLE;

				await NativeCraft.register(name, options);
				assert.equal(NativeCraft.isCraftTarget('example', ''), true);
			});
		});

		describe('.evaluate()', function () {
			it('should evalute 1 time.', async function () {
				const NativeCraft = defineCraft({
					get: () => EXAMPLE,
				});

				const craft = await NativeCraft.get('example');
				const matched = craft.evaluate([], []);

				assert.deepEqual(matched, {});
			});

			it('should throw if bad policy.', async function () {
				const NativeCraft = defineCraft({
					get: () => ({
						...EXAMPLE,
						policy: () => {
							throw new Error('foo');
						},
					}),
				});

				const craft = await NativeCraft.get('example');

				assert.throws(() => craft.evaluate([], []), {
					name: 'Error',
					message: 'Bad craft policy.',
				});
			});

			it('should assign and get a matched.', async function () {
				const NativeCraft = defineCraft({
					get: () => EXAMPLE,
				});

				const craft = await NativeCraft.get('example');

				const matched = craft.evaluate([
					{ id: '3d25b71e-8c33-4a2b-8f9e-4e1372971732', createdAt: Date.now() },
				], [
					{ id: '1f8e46da-b1a4-47b9-a956-1494e132d95f' },
				]);

				assert.deepEqual(matched, {
					'3d25b71e-8c33-4a2b-8f9e-4e1372971732': '1f8e46da-b1a4-47b9-a956-1494e132d95f',
				});
			});

			it('should throw if bad jobId when assign().', async function () {
				const NativeCraft = defineCraft({
					get: () => ({
						...EXAMPLE,
						policy: ({ assign }) => assign(null),
					}),
				});

				const craft = await NativeCraft.get('example');

				assert.throws(() => craft.evaluate([], []));
			});

			it('should throw if bad tentacleId when assign().', async function () {
				const NativeCraft = defineCraft({
					get: () => ({
						...EXAMPLE,
						policy: ({ assign }) => assign('', null),
					}),
				});

				const craft = await NativeCraft.get('example');

				assert.throws(() => craft.evaluate([], []));
			});

			it('should throw if bad tentacleId when assign().', async function () {
				const NativeCraft = defineCraft({
					get: () => ({
						...EXAMPLE,
						policy: ({ assign }) => assign('', null),
					}),
				});

				const craft = await NativeCraft.get('example');

				assert.throws(() => craft.evaluate([], []));
			});

			it('should throw if non-existent jobId when assign().', async function () {
				const NativeCraft = defineCraft({
					get: () => ({
						...EXAMPLE,
						policy: ({ assign }) => assign('', ''),
					}),
				});

				const craft = await NativeCraft.get('example');

				assert.throws(() => craft.evaluate([], []));
			});

			it('should throw if non-existent tentacle when assign().', async function () {
				const NativeCraft = defineCraft({
					get: () => ({
						...EXAMPLE,
						policy: ({ assign }) => assign('foo', ''),
					}),
				});

				const craft = await NativeCraft.get('example');

				assert.throws(() => craft.evaluate([{ id: 'foo' }], []));
			});
		});

		describe('.isSource()', function () {
			it('should be true', async function () {
				const NativeCraft = defineCraft({
					get: () => EXAMPLE,
				});

				const craft = await NativeCraft.get('example');

				assert.equal(craft.isSource(null), true);
			});

			it('should throw if bad .source()', async function () {
				const NativeCraft = defineCraft({
					get: () => ({
						...EXAMPLE,
						source: () => null,
					}),
				});

				const craft = await NativeCraft.get('example');

				assert.throws(() => craft.isSource(), {
					name: 'TypeError',
					message: 'Invalid "flag <= data.source()", one "boolean" expected.',
				});
			});
		});

		describe('.isTarget()', function () {
			it('should be true', async function () {
				const NativeCraft = defineCraft({
					get: () => EXAMPLE,
				});

				const craft = await NativeCraft.get('example');

				assert.equal(craft.isTarget(null), true);
			});

			it('should throw if bad .target()', async function () {
				const NativeCraft = defineCraft({
					get: () => ({
						...EXAMPLE,
						target: () => null,
					}),
				});

				const craft = await NativeCraft.get('example');

				assert.throws(() => craft.isTarget(), {
					name: 'TypeError',
					message: 'Invalid "flag <= data.target()", one "boolean" expected.',
				});
			});
		});
	});
});
