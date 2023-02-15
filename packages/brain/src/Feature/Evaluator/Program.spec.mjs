import * as assert from 'node:assert/strict';
import { describe, it } from 'mocha';

import { Program } from './Program.mjs';
import * as Instruction from './Instruction.mjs';

describe('Feature::Procedure::Evaluator::Program', function () {
	describe('constructor()', function () {
		it('should create a new Program.', function () {
			new Program({ *main() {} });
		});
	});

	describe('.value()', function () {
		it('should get a ValueInstruction.', function () {
			const program = new Program({ *main() {} });

			assert.ok(program.value(null) instanceof Instruction.VAL);
		});
	});

	describe('.run()', function () {
		it('should get a RunInstruction.', function () {
			const program = new Program({ *main() {} });

			assert.ok(program.run('foo') instanceof Instruction.RUN);
		});
	});

	describe('.all()', function () {
		it('should get a AllInstruction.', function () {
			const program = new Program({ *main() {} });

			assert.ok(program.all([]) instanceof Instruction.ALL);
		});
	});

	describe('.main()', function () {
		it('should get a CallInstruction.', function () {
			const program = new Program({ *main() {} });

			assert.ok(program.main() instanceof Instruction.CAL);
		});
	});
});
