import * as assert from 'node:assert/strict';
import { describe, it } from 'mocha';

import { Evaluator } from './index.mjs';
import { Extern } from './Extern.mjs';

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
		describe('._val()', function () {
			it('should get a value.', async function () {
				const vm = new Evaluator();
				const program = {
					*main() {
						return yield this._val(() => 'foo');
					},
				};

				const extern = new Evaluator.Extern(SampleData());
				assert.equal(await vm.execute(program, extern), 'foo');
			});

			it('should throw if bad value.', async function () {
				const vm = new Evaluator();
				const program = {
					*main() {
						return yield this._val('foo');
					},
				};

				const extern = new Evaluator.Extern(SampleData());
				await assert.rejects(async () => await vm.execute(program, extern), {
					name: 'TypeError',
					message: 'Invalid "value", one "function" expected.',
				});
			});
		});

		describe('._run()', function () {
			it('should set extern.done to false.', async function () {
				const program = {
					*SAT() {
						return yield this._run('example');
					},
					*main() {
						return yield this.SAT();
					},
				};

				const extern = new Evaluator.Extern({
					...SampleData(),
					crafts: {
						example: () => true,
					},
				});

				const vm = new Evaluator();

				assert.equal(await vm.execute(program, extern), undefined);
				assert.equal(extern.done, false);
			});

			it('should set extern.done true.', async function () {
				const program = {
					*main() {
						return yield this._run('example');
					},
				};

				const extern = new Evaluator.Extern({
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

				assert.equal(await vm.execute(program, extern), 'bar');
				assert.equal(extern.done, true);
			});

			it('should throw if bad craft.', async function () {
				const program = {
					*main() {
						return yield this._run(1);
					},
				};

				const extern = new Evaluator.Extern(SampleData());
				const vm = new Evaluator();

				await assert.rejects(async () => await vm.execute(program, extern), {
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

				const extern = new Evaluator.Extern({
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

				await assert.rejects(async () => await vm.execute(program, extern), {
					name: 'Error',
					message: 'baz',
				});
			});
		});

		describe('._all()', function () {
			it('should get [].', async function () {
				const program = {
					*main() {
						return yield this._all();
					},
				};

				const extern = new Evaluator.Extern(SampleData());
				const vm = new Evaluator();

				assert.deepEqual(await vm.execute(program, extern), []);
			});

			it('should get [value, value].', async function () {
				const program = {
					*main() {
						return yield this._all(
							this._val(() => 'foo'),
							'bar',
						);
					},
				};

				const extern = new Evaluator.Extern(SampleData());
				const vm = new Evaluator();

				assert.deepEqual(await vm.execute(program, extern), [{
					ok: true, value: 'foo',
				}, {
					ok: true, value: 'bar',
				}]);
			});

			it('should get [error, value]', async function () {
				const program = {
					*SAT() {
						let count = 0, cause = null, ok = false;

						while (!ok && count < 3) {
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
						return yield this._all(
							this._val(() => 'foo'),
							this.SAT(),
						);
					},
				};

				const extern = new Evaluator.Extern(SampleData());
				const vm = new Evaluator();

				assert.deepEqual(await vm.execute(program, extern), [{
					ok: true,
					value: 'foo',
				}, {
					ok: false,
					error: new Error('SAT failed 3 time.'),
				},
				]);
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
				return yield this._all(
					this.SAT(),
					this.SAT(),
				);
			},
		};

		const options = {
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
		};

		const vm = new Evaluator();
		const extern0 = new Evaluator.Extern(options);

		await vm.execute(program, extern0);
		assert.equal(extern0.done, false);

		options.dump.children[0] = extern0.dump.children[0];

		options.finished[options.dump.children[0].values[2]] = {
			id: '...', ok: true, error: null, target: 'hello',
		};

		const extern1 = new Evaluator.Extern(options);

		assert.deepEqual(await vm.execute(program, extern1), [{
			ok: true, value: 'hello',
		}, {
			ok: true, value: 'world',
		}]);
		assert.equal(extern1.done, true);
	});
});

function SampleContextData() {
	return {
		dump: { values: [], children: [] },
		finished: {},
		crafts: { example: () => {} },
	};
}

describe('CustomExtern::', function () {
	it('should create a extern.', function () {
		new Extern(SampleContextData());
	});

	describe('hasJob()', function () {
		it('should get false.', function () {
			const extern = new Extern(SampleContextData());

			assert.equal(extern.hasJob('abc'), false);
		});

		it('should get true.', function () {
			const extern = new Extern({
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

			assert.equal(extern.hasJob('foo'), true);
		});
	});

	describe('fetchJob()', function () {
		it('should get a job record.', function () {
			const extern = new Extern({
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

			assert.deepEqual(extern.fetchJob('foo'), {
				id: 'bar',
				ok: true,
				error: null,
				target: [1],
			});
		});
	});

	describe('assertCraftAndSource()', function () {
		it('should throw if bad name.', function () {
			const extern = new Extern(SampleContextData());

			assert.throws(() => extern.assertCraftAndSource('foo'), {
				name: 'Error',
				message: 'Invalid craft(foo)',
			});
		});
		it('should throw if bad source.', function () {
			const extern = new Extern({
				...SampleContextData(),
				crafts: { foo: () => false },
			});

			assert.throws(() => extern.assertCraftAndSource('foo', null), {
				name: 'Error',
				message: 'Bad craft(foo) source.',
			});
		});
	});

	describe('planJob()', function () {
		it('should plan a new job.', function () {
			const extern = new Extern({
				...SampleContextData(),
				crafts: { foo: () => true },
			});

			extern.planJob('abc', 'foo', [1, 2, 3]);

			assert.deepEqual(extern.creating, [
				{ id: 'abc', craft: 'foo', source: [1, 2, 3] },
			]);
		});
	});
});
