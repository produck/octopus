import * as Instruction from './Instruction.mjs';

export class Engine {
	context = null;

	call(routine) {
		const scope = {
			blocked: false,
			ret: undefined,
			thrown: false,
			error: undefined,
		};

		let nextValue;

		while (!scope.blocked) {
			const { value, done } = scope.thrown
				? routine.throw(nextValue)
				: routine.next(nextValue);

			if (done) {
				scope.ret = value;

				break;
			}

			scope.thrown = false;
			scope.error = undefined;

			if (Instruction.isInstruction(value)) {
				throw new Error('Illegal instruction.');
			}

			try {
				nextValue = value.execute(this, scope);
			} catch (error) {
				scope.thrown = true;
				nextValue = error;
			}
		}

		return scope;
	}

	execute(program, context, order) {
		try {
			this.context = context;
			this.call(program.main(order));
		} finally {
			this.context = null;
		}
	}
}
