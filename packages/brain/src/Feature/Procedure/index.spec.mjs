import * as assert from 'node:assert/strict';
import { describe, it } from 'mocha';

import { defineProcedure, Data } from './index.mjs';

describe('::Feature::Procedure', function () {
	describe('::deineProcedure()', function () {
		const NativeProcedure = defineProcedure();

		assert.equal(NativeProcedure.name, 'NativeProcedureProxy');
	});

	describe('::NativeProcedure', function () {
		const EXAMPLE = Data.normalize({
			name: 'example',
			script: { *main() {} },
		});

		describe('::has()', function () {
			for (const value of [true, false]) {
				it(`should get ${value}.`, async function () {
					const NativeProcedure = defineProcedure({
						has: () => value,
					});

					assert.equal(await NativeProcedure.has('foo'), value);
				});
			}
		});

		describe('::get()', function () {
			it('should get a procedure.', async function () {
				const NativeProcedure = defineProcedure({
					has: () => true,
					get: () => ({ ...EXAMPLE }),
				});

				const procedure = await NativeProcedure.get('example');

				assert.equal(procedure.name, EXAMPLE.name);
			});

			it('should throw if bad name.', async function () {
				const NativeProcedure = defineProcedure({
					has: () => false,
				});

				await assert.rejects(async () => await NativeProcedure.get(1), {
					name: 'TypeError',
					message: 'Invalid "name", one "string" expected.',
				});
			});

			it('should throw if undefined procedure.', async function () {
				const NativeProcedure = defineProcedure({
					has: () => false,
				});

				await assert.rejects(async () => await NativeProcedure.get('example'), {
					name: 'Error',
					message: 'Undefined procedure(example).',
				});
			});

			it('should throw if data === null', async function () {
				const NativeProcedure = defineProcedure({
					has: () => true,
					get: () => null,
				});

				await assert.rejects(async () => await NativeProcedure.get('example'), {
					name: 'Error',
					message: 'There MUST be a procedure named "example".',
				});
			});
		});

		describe('::create()', function () {
			it('should create a procedure.', async function () {
				const NativeProcedure = defineProcedure({
					has: () => false,
					get: () => EXAMPLE,
					create: () => EXAMPLE,
				});

				const { name, ...options } = EXAMPLE;
				const procedure = await NativeProcedure.create(name, options);

				assert.equal(procedure.name, EXAMPLE.name);
			});

			it('should throw if duplicated.', async function () {
				const NativeProcedure = defineProcedure({
					has: () => true,
					get: () => EXAMPLE,
				});

				const { name, ...options } = EXAMPLE;

				await assert.rejects(async () => await NativeProcedure.create(name, options), {
					name: 'Error',
					message: 'Duplicated procedure name(example).',
				});
			});
		});

		describe('::register()', function () {
			it('should register a procedure.', async function () {
				const NativeProcedure = defineProcedure({
					has: () => false,
					get: () => EXAMPLE,
					create: () => EXAMPLE,
				});

				const { name, ...options } = EXAMPLE;
				const procedure = await NativeProcedure.register(name, options);

				assert.equal(procedure.name, EXAMPLE.name);
			});
		});

		describe('::isValid()', function () {
			it('should be true.', async function () {
				const NativeProcedure = defineProcedure({
					has: () => false,
					get: () => EXAMPLE,
					create: () => EXAMPLE,
				});

				const { name, ...options } = EXAMPLE;

				await NativeProcedure.register(name, options);

				assert.equal(NativeProcedure.isValid(name), true);
			});
		});

		describe('::assertValid()', function () {
			it('should throw if bad name.', async function () {
				const NativeProcedure = defineProcedure({
					has: () => false,
					get: () => EXAMPLE,
					create: () => EXAMPLE,
				});

				assert.throws(() => NativeProcedure.assertValid('foo'), {
					name: 'Error',
					message: 'There is no procedure(foo).',
				});
			});
		});

		describe('::isProcedureOrder()', function () {
			it('should be true.', async function () {
				const NativeProcedure = defineProcedure({
					has: () => false,
					get: () => EXAMPLE,
					create: () => EXAMPLE,
				});

				const { name, ...options } = EXAMPLE;

				await NativeProcedure.register(name, options);
				assert.equal(NativeProcedure.isProcedureOrder('example', ''), true);
			});
		});

		describe('::isProcedureArtifact()', function () {
			it('should be true.', async function () {
				const NativeProcedure = defineProcedure({
					has: () => false,
					get: () => EXAMPLE,
					create: () => EXAMPLE,
				});

				const { name, ...options } = EXAMPLE;

				await NativeProcedure.register(name, options);
				assert.equal(NativeProcedure.isProcedureArtifact('example', ''), true);
			});
		});

		describe('.isOrder()', function () {
			it('should be true', async function () {
				const NativeProcedure = defineProcedure({
					get: () => EXAMPLE,
					has: () => true,
				});

				const procedure = await NativeProcedure.get('example');

				assert.equal(procedure.isOrder(null), true);
			});

			it('should throw if bad .order()', async function () {
				const NativeProcedure = defineProcedure({
					get: () => ({
						...EXAMPLE,
						order: () => null,
					}),
					has: () => true,
				});

				const procedure = await NativeProcedure.get('example');

				assert.throws(() => procedure.isOrder(), {
					name: 'TypeError',
					message: 'Invalid "flag <= data.order()", one "boolean" expected.',
				});
			});
		});

		describe('.isArtifact()', function () {
			it('should be true', async function () {
				const NativeProcedure = defineProcedure({
					get: () => EXAMPLE,
					has: () => true,
				});

				const procedure = await NativeProcedure.get('example');

				assert.equal(procedure.isArtifact(null), true);
			});

			it('should throw if bad .artifact()', async function () {
				const NativeProcedure = defineProcedure({
					get: () => ({
						...EXAMPLE,
						artifact: () => null,
					}),
					has: () => true,
				});

				const procedure = await NativeProcedure.get('example');

				assert.throws(() => procedure.isArtifact(), {
					name: 'TypeError',
					message: 'Invalid "flag <= data.artifact()", one "boolean" expected.',
				});
			});
		});

		describe('.evaluate()', function () {
			it('should get artifact.', async function () {
				const NativeProcedure = defineProcedure({
					has: () => true,
					get: () => ({ ...EXAMPLE }),
				});

				const procedure = await NativeProcedure.get('example');

				assert.deepEqual(procedure.evaluate(null, {}), {
					ok: true,
					done: true,
					artifact: undefined,
				});
			});

			it('should throw if bad artifact.', async function () {
				const NativeProcedure = defineProcedure({
					has: () => true,
					get: () => ({ ...EXAMPLE, artifact: () => false }),
				});

				const procedure = await NativeProcedure.get('example');

				assert.deepEqual(procedure.evaluate(null, {}), {
					ok: false,
					done: true,
					error: 'Invalid "artifact <= vm.execute()", one "valid artifact" expected.',
				});
			});

			it('should not done if new job.', async function () {
				const script = {
					*main() {
						return yield this.run('example');
					},
				};

				const NativeProcedure = defineProcedure({
					has: () => true,
					get: () => ({...EXAMPLE, script }),
				});

				const procedure = await NativeProcedure.get('example');

				assert.deepEqual(procedure.evaluate(null, {
					crafts: { example: () => true },
				}), {
					ok: true,
					done: false,
				});
			});
		});
	});
});
