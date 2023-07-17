import { webcrypto as crypto } from 'node:crypto';

import * as Crank from '@produck/crank';
import { T, U } from '@produck/mold';

import { Context } from './Context.mjs';
import { Dump } from './Dump.mjs';

export const Evaluator = Crank.Engine({
	name: 'EvaluatorEngine',
	Extern: Context,
	abort: (lastInstruction, process) => {
		if (!process.abort) {
			process.abort = process.top.blocked;
		}

		return !!process.abort;
	},
	call: async (process, nextFrame, next) =>  {
		if (!process.top.dump) {
			process.top.dump = new Dump({values: [], children: [process.extern.dump]});
		}

		nextFrame.dump = process.top.dump.fetchChild();

		await next();

		process.extern.done = !process.abort;
	},
}, {
	value(process, ...args) {
		const { top } = process;

		return top.dump.fetchValue(...args);
	},
	run(process, ...args) {
		const [craft, source] = args;

		if (!T.Native.String(craft)) {
			U.throwError('craft', 'string');
		}

		const { top, extern } = process;
		const id = top.dump.fetchValue(() => crypto.randomUUID());

		if (!extern.hasJob(id)) {
			extern.planJob(id, craft, source);

			top.blocked = true;
		} else {
			const { ok, error, target } = extern.fetchJob(id);

			if (ok) {
				return target;
			} else {
				throw new Error(error);
			}
		}
	},
	async all(process, args) {
		const ret = [];

		for (const instruction of args) {
			if (Crank.isToken(instruction)) {
				const val = await instruction.execute();

				ret.push(val);
			} else {
				ret.push(instruction);
			}
		}

		return ret;
	},
});

export { Evaluator as Engine };
