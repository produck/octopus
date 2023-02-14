/* eslint-disable require-yield */
import * as assert from 'node:assert/strict';
import { describe, it } from 'mocha';

import { Engine, Context, Program } from './index.mjs';

function SampleData() {
	return {
		history: [],
		finished: {},
		crafts: {
			example: () => {},
		},
	};
}

describe('Feature::Procedure::Evaluator', function () {
	describe('::Engine', function () {
		describe('execute()', function () {
			it('should execute a program.', function () {
				const program = new Program({
					*main() {
						return 'foo';
					},
				});

				const context = new Context(SampleData());
				const vm = new Engine();

				assert.equal(vm.execute(program, context), 'foo');
			});

			it('should throw if not instruction', function () {
				const program = new Program({
					*main() {
						return yield;
					},
				});

				const context = new Context(SampleData());
				const vm = new Engine();

				assert.throws(() => vm.execute(program, context), {
					name: 'Error',
					message: 'Illegal instruction.',
				});

				assert.equal(vm.context, null);
			});

			it('should throw if bad program.', function () {
				const vm = new Engine();

				assert.throws(() => vm.execute(null), {
					name: 'TypeError',
					message: 'Invalid "program", one "Program" expected.',
				});
			});

			it('should throw if bad context.', function () {
				const program = new Program({
					*main() {
						return 'foo';
					},
				});

				const vm = new Engine();

				assert.throws(() => vm.execute(program), {
					name: 'TypeError',
					message: 'Invalid "context", one "Context" expected.',
				});
			});
		});
	});

	describe('::Instruction', function () {
		describe('::VAL', function () {
			it('should get a value.', function () {
				const program = new Program({
					*main() {
						return yield this.value('foo');
					},
				});

				const context = new Context(SampleData());
				const vm = new Engine();

				assert.equal(vm.execute(program, context), 'foo');
			});
		});

		describe('::RUN', function () {
			it('should set context.done to false.', function () {
				const program = new Program({
					*main() {
						return yield this.run('example');
					},
				});

				const context = new Context({
					...SampleData(),
					crafts: {
						example: () => true,
					},
				});

				const vm = new Engine();

				assert.equal(vm.execute(program, context), undefined);
				assert.equal(context.done, false);
			});

			it('should set context.done to true.', function () {
				const program = new Program({
					*main() {
						return yield this.run('example');
					},
				});

				const context = new Context({
					...SampleData(),
					history: ['foo'],
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

				const vm = new Engine();

				assert.equal(vm.execute(program, context), 'bar');
				assert.equal(context.done, true);
			});

			it('should throw if bad craft.', function () {
				const program = new Program({
					*main() {
						return yield this.run(1);
					},
				});

				const context = new Context(SampleData());
				const vm = new Engine();

				assert.throws(() => vm.execute(program, context), {
					name: 'TypeError',
					message: 'Invalid "craft", one "string" expected.',
				});
			});

			it('should throw if job not ok.', function () {
				const program = new Program({
					*main() {
						return yield this.run('example');
					},
				});

				const context = new Context({
					...SampleData(),
					history: ['foo'],
					finished: {
						foo: {
							id: 'foo',
							ok: false,
							error: 'baz',
							target: null,
						},
					},
					crafts: {
						example: () => true,
					},
				});

				const vm = new Engine();

				assert.throws(() => vm.execute(program, context), {
					name: 'Error',
					message: 'baz',
				});
			});
		});

		describe('::CAL', function () {
			it('should call main.', function () {
				const program = new Program({
					*main() {
						return 'foo';
					},
				});

				const context = new Context(SampleData());
				const vm = new Engine();

				assert.equal(vm.execute(program, context), 'foo');
			});

			it('should throw if child throw and not catch.', function () {
				const program = new Program({
					*throws() {
						throw new Error('bar');
					},
					*main() {
						yield this.throws();

						return 'foo';
					},
				});

				const context = new Context(SampleData());
				const vm = new Engine();

				assert.throws(() => vm.execute(program, context), {
					name: 'Error',
					message: 'bar',
				});
			});
		});

		describe('::ALL', function () {
			it('should get [].', function () {
				const program = new Program({
					*main() {
						return yield this.all([]);
					},
				});

				const context = new Context(SampleData());
				const vm = new Engine();

				assert.deepEqual(vm.execute(program, context), []);
			});

			it('should get [value, value].', function () {
				const program = new Program({
					*main() {
						return yield this.all([
							this.value('foo'),
							this.value('bar'),
						]);
					},
				});

				const context = new Context(SampleData());
				const vm = new Engine();

				assert.deepEqual(vm.execute(program, context), ['foo', 'bar']);
			});
		});
	});
});
