import { Normalizer, P, PROPERTY, S } from '@produck/mold';

import * as Instruction from './Instruction.mjs';

const GeneratorFunction = (function* () {})().constructor.constructor;

export const ScriptSchema = S.Object({
	main: P.Instance(GeneratorFunction),
	[PROPERTY]: P.Instance(GeneratorFunction),
});

const normalizeScript = Normalizer(ScriptSchema);

export class Program {
	constructor(_script) {
		const script = normalizeScript(_script);

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
