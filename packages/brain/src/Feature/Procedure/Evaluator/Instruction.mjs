import { webcrypto as crypto } from 'node:crypto';
import { Normalizer, P, S, T, U } from '@produck/mold';

const map = new WeakMap();
const getArgs = instruction => map.get(instruction);

export class Instruction {
	constructor(...args) {
		this._assertArgs(...args);
		map.set(this, args);
		Object.freeze(this);
	}

	_assertArgs() {}
}

class ValueInstruction extends Instruction {
	execute(vm) {
		return vm.context.fetchValue(...getArgs(this));
	}
}

class RunInstruction extends Instruction {
	execute(vm, scope) {
		const id = vm.context.fetchValue(crypto.randomUUID());

		if (!vm.context.hasJob(id)) {
			const [craft, source] = getArgs(this);

			vm.context.planJob(id, craft, source);
			scope.blocked = true;
		} else {
			const { ok, error, target } = vm.context.fetchJob(id);

			if (ok) {
				return target;
			} else {
				throw new Error(error);
			}
		}
	}

	_assertArgs(craft) {
		if (!T.Native.String(craft)) {
			U.throwError('craft', 'string');
		}
	}
}

class CallInstruction extends Instruction {
	execute(vm, scope) {
		const [routine] = getArgs(this);
		const childScope = vm.call(routine);

		scope.blocked ||= childScope.blocked;

		return childScope.ret;
	}
}

const InstructionListSchema = S.Array({
	items: P.Instance(Instruction),
});

const normalizeInstructionList = Normalizer(InstructionListSchema);

class AllInstruction extends Instruction {
	execute(vm, scope) {
		const [list] = getArgs(this);
		const ret = [];

		for (const instruction of list) {
			ret.push(instruction.execute(vm, scope));
		}

		return ret;
	}

	_assertArgs(list) {
		normalizeInstructionList(list);
	}
}

export {
	ValueInstruction as VAL,
	RunInstruction as RUN,
	AllInstruction as ALL,
	CallInstruction as CAL,
};

export const isInstruction = any => map.has(any);
