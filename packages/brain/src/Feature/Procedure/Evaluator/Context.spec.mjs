import * as assert from 'node:assert/strict';
import { describe, it } from 'mocha';

import { Context } from './Context.mjs';

describe('Feature::Procedure::Evaluator::Context', function () {
	function SampleData() {
		return {
			history: [],
			finished: {},
			crafts: {
				example: () => {},
			},
		};
	}

	describe('constructor()', function () {
		it('should create a context.', function () {
			new Context(SampleData());
		});
	});

	describe('fetchValue()', function () {
		it('shoud append a new value.', function () {
			const context = new Context(SampleData());

			assert.equal(context.index, 0);
			assert.deepEqual(context.history, []);
			assert.equal(context.fetchValue(1), 1);
			assert.equal(context.index, 1);
			assert.deepEqual(context.history, [1]);
		});

		it('should get a history value.', function () {
			const context = new Context({
				...SampleData(),
				history: ['foo'],
			});

			assert.equal(context.fetchValue(1), 'foo');
			assert.equal(context.index, 1);
			assert.equal(context.fetchValue(1), 1);
			assert.deepEqual(context.history, ['foo', 1]);
		});
	});

	describe('hasJob()', function () {
		it('should get false.', function () {
			const context = new Context(SampleData());

			assert.equal(context.hasJob('abc'), false);
		});

		it('should get true.', function () {
			const context = new Context({
				...SampleData(),
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
				...SampleData(),
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
			const context = new Context(SampleData());

			assert.throws(() => context.assertCraftAndSource('foo'), {
				name: 'Error',
				message: 'Invalid craft(foo)',
			});
		});

		it('should throw if bad source.', function () {
			const context = new Context({
				...SampleData(),
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
				...SampleData(),
				crafts: { foo: () => true },
			});

			context.planJob('abc', 'foo', [1, 2, 3]);

			assert.deepEqual(context.creating, [
				{ id: 'abc', craft: 'foo', source: [1, 2, 3] },
			]);
		});
	});
});
