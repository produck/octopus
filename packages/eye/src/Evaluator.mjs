import { webcrypto as crypto } from 'node:crypto';

import * as Crank from '@produck/crank';
import { T, U } from '@produck/mold';

import { Context } from './Context.mjs';
import { Dump } from './Dump.mjs';

const map = new WeakMap();

export const Evaluator = Crank.Engine({
	name: 'EvaluatorEngine',
	Extern: Context,
	abort: (lastInstruction, process) => {
		const scope = map.get(process);

		if (!scope.blocked) {
			scope.blocked = map.get(process.top).blocked;
		}

		return scope.blocked;
	},
	call: async (process, nextFrame, next) =>  {
		if (!map.has(process)) {
			map.set(process, {
				blocked: false,
			});

			map.set(process.top, {
				dump: new Dump({values: [], children: [process.extern.dump]}),
				blocked: false,
			});
		}

		map.set(nextFrame, {
			dump: map.get(process.top).dump.fetchChild(),
			blocked: false,
		});

		await next();

		process.extern.done = !map.get(process).blocked;
	},
}, {
	value(process, instruction, ...args) {
		const { top } = process;

		return map.get(top).dump.fetchValue(...args);
	},
	run(process, instruction, ...args) {
		const [craft, source] = args;

		if (!T.Native.String(craft)) {
			U.throwError('craft', 'string');
		}

		const { top, extern } = process;
		const scope = map.get(top);
		const id =  scope.dump.fetchValue(() => crypto.randomUUID());

		if (!extern.hasJob(id)) {
			scope.blocked = true;

			extern.planJob(id, craft, source);
		} else {
			const { ok, error, target } = extern.fetchJob(id);

			if (ok) {
				return target;
			} else {
				throw new Error(error);
			}
		}
	},
	async all(process, instruction, args) {
		const ret = [];

		if (!Array.isArray(args)) {
			U.throwError('args', 'boolean');
		}

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
