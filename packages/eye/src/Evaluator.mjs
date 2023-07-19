import { webcrypto as crypto } from 'node:crypto';

import * as Crank from '@produck/crank';
import { T, U } from '@produck/mold';

import { Extern } from './Extern.mjs';
import { Dump } from './Dump.mjs';

export const Evaluator = Crank.Engine({
	name: 'EvaluatorEngine',
	Extern,
	abort: (currentToken, lastToken) => {
		const extern = currentToken.process.extern;
		const done = extern.fetchData(currentToken) && extern.fetchData(lastToken);

		extern.saveData(currentToken, done);
		extern.done = done;

		return !done;
	},
	call: async (currentToken, next, nextFrame) =>  {
		const { process, frame } = currentToken;
		const extern = process.extern;

		extern.saveData(currentToken, true);

		if (!extern.hasData(frame)) {
			extern.saveData(frame,
				new Dump({values: [], children: [process.extern.dump]}));
		}

		extern.saveData(nextFrame, extern.fetchData(frame).fetchChild());

		await next();
	},
}, {
	val: function value(currentToken, args) {
		const { process, frame } = currentToken;
		const extern = process.extern;
		const dump = extern.fetchData(frame);

		extern.saveData(currentToken, true);

		return dump.fetchValue(...args);
	},
	run(currentToken, args) {
		const { process, frame } = currentToken;
		const extern = process.extern;

		extern.saveData(currentToken, true);

		const [craft, source] = args;

		if (!T.Native.String(craft)) {
			U.throwError('craft', 'string');
		}

		const dump = extern.fetchData(frame);
		const id =  dump.fetchValue(() => crypto.randomUUID());

		if (!extern.hasJob(id)) {
			extern.planJob(id, craft, source);

			extern.saveData(currentToken, false);
		} else {
			const { ok, error, target } = extern.fetchJob(id);

			if (ok) {
				return target;
			} else {
				throw new Error(error);
			}
		}
	},
	async all(currentToken, args) {
		const extern = currentToken.process.extern;
		const returnValue = [];
		let done = true;


		for (const instruction of args) {
			const result = { ok: true };

			if (Crank.isToken(instruction)) {
				try {
					result.value = await instruction.execute();
				} catch (error) {
					result.ok = false;
					result.error = error;
				}

				done &&= extern.fetchData(instruction);
			} else {
				result.value = instruction;
			}

			returnValue.push(result);
		}

		extern.saveData(currentToken, done);

		return returnValue;
	},
});
