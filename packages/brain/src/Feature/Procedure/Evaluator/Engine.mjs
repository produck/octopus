import { U } from '@produck/mold';

import * as Instruction from './Instruction.mjs';
import { Program } from './Program.mjs';
import { Context } from './Context.mjs';

export class Engine {
	context = null;

	call(routine) {
		const scope = { blocked: false, ret: undefined };

		let nextValue, thrown = false;

		while (!scope.blocked) {
			const { value, done } = thrown
				? routine.throw(nextValue)
				: routine.next(nextValue);

			if (done) {
				scope.ret = value;

				break;
			}

			if (!Instruction.isInstruction(value)) {
				throw new Error('Illegal instruction.');
			}

			try {
				thrown = false;
				nextValue = value.execute(this, scope);
			} catch (error) {
				thrown = true;
				nextValue = error;
			}
		}

		return scope;
	}

	* #boot(MAIN_CALL) {
		const mainScope = yield MAIN_CALL;

		this.context.done = !mainScope.blocked;

		return mainScope;
	}

	execute(program, context, order) {
		if (!(program instanceof Program)) {
			U.throwError('program', 'Program');
		}

		if (!(context instanceof Context)) {
			U.throwError('context', 'Context');
		}

		try {
			this.context = context;

			const callMain = program.main(order);
			const boot = this.#boot(callMain);
			const globalScope = this.call(boot);

			return globalScope.ret;
		} finally {
			this.context = null;
		}
	}
}
