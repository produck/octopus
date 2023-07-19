import * as assert from 'node:assert/strict';
import { describe, it } from 'mocha';

import * as Evaluator from './index.mjs';

describe('Evaluator::', function () {
	it('should create an evaluator.', function () {
	});
	describe('executors', function () {
		describe('.value()', function () {
			it('should get a value.', function () {
			});
		});

		describe('.run()', function () {
			it('should set the done of executor to false.', function () {
			});

			it('should set the done of executor true.', function () {
			});

			it('should throw if bad craft.', function () {
			});

			it('should throw if job not ok.', function () {
			});
		});

		describe('.all()', function () {
			it('should get [].', function () {
			});

			it('should get [value, value].', function () {
			});
		});
	});

	it('should pass a complex case.', function () {
	});
});

describe('Context::', function () {
	it('should create a context.', function () {
	});

	describe('hasJob()', function () {
		it('should get false.', function () {
		});

		it('should get true.', function () {
		});
	});

	describe('fetchJob()', function () {
		it('should get a job record.', function () {
		});
	});

	describe('assertCraftAndSource()', function () {
		it('should throw if bad name.', function () {
		});
		it('should throw if bad source.', function () {
		});
	});

	describe('planJob()', function () {
		it('should plan a new job.', function () {
		});
	});
});
