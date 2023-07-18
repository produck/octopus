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
		const ret = [];
		let done = true;

		for (const instruction of args) {
			if (Crank.isToken(instruction)) {
				let value;

				try {
					value = await instruction.execute();
				} catch (error) {
					value = error;
				}

				ret.push(value);

				done &&= extern.fetchData(instruction);
			} else {
				ret.push(instruction);
			}
		}

		extern.saveData(currentToken, done);

		return ret;
	},
});
