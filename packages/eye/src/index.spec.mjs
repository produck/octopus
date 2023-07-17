import * as assert from 'node:assert/strict';
import { describe, it } from 'mocha';

import { Evaluator } from './index.mjs';
import { Context } from './Context.mjs';

function SampleData() {
	return {
		crafts: {
			example: () => {},
		},
	};
}

describe('Evaluator::', function () {
	it('should create an evaluator.', function () {
		new Evaluator();
	});
	describe('executors', function () {
		describe('._value()', function () {
			it('should get a value.', async function () {
				const vm = new Evaluator();
				const program = {
					*main() {
						return yield this._value(() => 'foo');
					},
				};

				const context = new Evaluator.Extern(SampleData());
				assert.equal(await vm.execute(program, context), 'foo');
			});

			it('should throw if bad value.', async function () {
				const vm = new Evaluator();
				const program = {
					*main() {
						return yield this._value('foo');
					},
				};

				const context = new Evaluator.Extern(SampleData());
				await assert.rejects(async () => await vm.execute(program, context), {
					name: 'TypeError',
					message: 'Invalid "value", one "function" expected.',
				});
			});
		});

		describe('._run()', function () {
			it('should set context.done to false.', async function () {
				const program = {
					*SAT() {
						return yield this._run('example');
					},
					*main() {
						return yield this.SAT();
					},
				};

				const context = new Evaluator.Extern({
					...SampleData(),
					crafts: {
						example: () => true,
					},
				});

				const vm = new Evaluator();

				assert.equal(await vm.execute(program, context), undefined);
				assert.equal(context.done, false);
			});

			it('should set context.done true.', async function () {
				const program = {
					*main() {
						return yield this._run('example');
					},
				};

				const context = new Evaluator.Extern({
					...SampleData(),
					dump: { values: ['foo'], children: [] },
					finished: {
						foo: {
							id: 'foo',
							ok: true,
							error: null,
							target: 'bar',
						},
					},
					crafts: {
						example: () => true,
					},
				});

				const vm = new Evaluator();

				assert.equal(await vm.execute(program, context), 'bar');
				assert.equal(context.done, true);
			});

			it('should throw if bad craft.', async function () {
				const program = {
					*main() {
						return yield this._run(1);
					},
				};

				const context = new Evaluator.Extern(SampleData());
				const vm = new Evaluator();

				await assert.rejects(async () => await vm.execute(program, context), {
					name: 'TypeError',
					message: 'Invalid "craft", one "string" expected.',
				});
			});

			it('should throw if job not ok.', async function () {
				const program = {
					*main() {
						return yield this._run('example');
					},
				};

				const context = new Evaluator.Extern({
					...SampleData(),
					dump: { values: ['foo'], children: [] },
					finished: {
						foo: {
							id: 'foo',
							ok: false,
							error: 'baz',
							target: null,
						},
					},
				});

				const vm = new Evaluator();

				await assert.rejects(async () => await vm.execute(program, context), {
					name: 'Error',
					message: 'baz',
				});
			});
		});

		describe('._all()', function () {
			it('should get [].', async function () {
				const program = {
					*main() {
						return yield this._all([]);
					},
				};

				const context = new Evaluator.Extern(SampleData());
				const vm = new Evaluator();

				assert.deepEqual(await vm.execute(program, context), []);
			});

			it('should get [value, value].', async function () {
				const program = {
					*main() {
						return yield this._all([
							this._value(() => 'foo'),
							'bar',
						]);
					},
				};

				const context = new Evaluator.Extern(SampleData());
				const vm = new Evaluator();

				assert.deepEqual(await vm.execute(program, context), ['foo', 'bar']);
			});
		});
	});

	it('should pass a complex case.', async function () {
		const MAX_SAT_TIMES = 3;

		const program = {
			*SAT() {
				let count = 0, cause = null, ok = false;

				while (!ok && count < MAX_SAT_TIMES) {
					try {
						return yield this._run('foo', {});
					} catch (error) {
						cause = error;
					}

					count++;
				}

				throw new Error('SAT failed 3 time.', { cause });
			},
			*main() {
				return yield this._all([
					this.SAT(),
					this.SAT(),
				]);
			},
		};

		const context = new Evaluator.Extern({
			...SampleData(),
			crafts: { foo: () => true },
			dump: {
				values: [],
				children: [
					{ values: ['a', 'b'] },
					{ values: ['c'] },
				],
			},
			finished: {
				a: { id: 'a', ok: false, error: 'test', target: null },
				b: { id: 'b', ok: false, error: 'testtest', target: null },
				c: { id: 'c', ok: true, error: null, target: 'world' },
			},
		});

		const vm = new Evaluator();

		await vm.execute(program, context);
		assert.equal(context.done, false);

		context.finished[context.dump.children[0].values[2]] = {
			id: '...', ok: true, error: null, target: 'hello',
		};

		assert.deepEqual(await vm.execute(program, context), ['hello', 'world']);
		assert.equal(context.done, true);
	});
});

function SampleContextData() {
	return {
		dump: { values: [], children: [] },
		finished: {},
		crafts: { example: () => {} },
	};
}

describe('Context::', function () {
	it('should create a context.', function () {
		new Context(SampleContextData());
	});

	describe('hasJob()', function () {
		it('should get false.', function () {
			const context = new Context(SampleContextData());

			assert.equal(context.hasJob('abc'), false);
		});

		it('should get true.', function () {
			const context = new Context({
				...SampleContextData(),
				finished: {
					'foo': {
						id: 'bar',
						ok: true,
						error: null,
						target: [1],
					},
				},
			});

			assert.equal(context.hasJob('foo'), true);
		});
	});

	describe('fetchJob()', function () {
		it('should get a job record.', function () {
			const context = new Context({
				...SampleContextData(),
				finished: {
					'foo': {
						id: 'bar',
						ok: true,
						error: null,
						target: [1],
					},
				},
			});

			assert.deepEqual(context.fetchJob('foo'), {
				id: 'bar',
				ok: true,
				error: null,
				target: [1],
			});
		});
	});

	describe('assertCraftAndSource()', function () {
		it('should throw if bad name.', function () {
			const context = new Context(SampleContextData());

			assert.throws(() => context.assertCraftAndSource('foo'), {
				name: 'Error',
				message: 'Invalid craft(foo)',
			});
		});
		it('should throw if bad source.', function () {
			const context = new Context({
				...SampleContextData(),
				crafts: { foo: () => false },
			});

			assert.throws(() => context.assertCraftAndSource('foo', null), {
				name: 'Error',
				message: 'Bad craft(foo) source.',
			});
		});
	});

	describe('planJob()', function () {
		it('should plan a new job.', function () {
			const context = new Context({
				...SampleContextData(),
				crafts: { foo: () => true },
			});

			context.planJob('abc', 'foo', [1, 2, 3]);

			assert.deepEqual(context.creating, [
				{ id: 'abc', craft: 'foo', source: [1, 2, 3] },
			]);
		});
	});
});
