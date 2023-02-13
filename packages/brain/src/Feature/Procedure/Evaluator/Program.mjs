import * as Instruction from './Instruction.mjs';

export class Program {
	constructor(script) {
		for (const name in script) {
			const fn = script[name];

			this[name] = (...args) => new Instruction.CAL(fn.call(this, ...args));
		}
	}

	value(value) {
		return new Instruction.VAL(value);
	}

	run(craftName, source) {
		return new Instruction.RUN(craftName, source);
	}

	all(list) {
		return new Instruction.ALL(list);
	}
}
