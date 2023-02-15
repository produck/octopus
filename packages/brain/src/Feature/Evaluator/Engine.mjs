import { U } from '@produck/mold';

import * as Instruction from './Instruction.mjs';
import { Program } from './Program.mjs';
import { Context } from './Context.mjs';

class Dump {
	constructor(data) {
		this.data = data;
		this.valueIndex = 0;
		this.childIndex = 0;
	}

	fetchChild() {
		const index = this.childIndex++;
		const { children } = this.data;

		const childData = index < children.length
			? children[index]
			: children[index] = { values: [], children: [] };

		return new Dump(childData);
	}

	fetchValue(value) {
		const index = this.valueIndex++;
		const { values } = this.data;

		return index < values.length ? values[index] : values[index] = value;
	}
}

export class Engine {
	context = null;

	call(routine, dump) {
		const scope = { blocked: false, ret: undefined, dump };

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
			const dump = new Dump({ values: [], children: [context.dump] });
			const globalScope = this.call(boot, dump);

			return globalScope.ret;
		} finally {
			this.context = null;
		}
	}
}
