import { webcrypto as crypto } from 'node:crypto';

import * as Crank from '@produck/crank';
import { T, U } from '@produck/mold';

import { Context } from './Context.mjs';
import { Dump } from './Dump.mjs';

export const Evaluator = Crank.Engine({
	name: 'EvaluatorEngine',
	Extern: Context,
	abort: (currentToken, lastToken) => {
		const context = currentToken.process.extern;
		const done = context.fetchData(currentToken) && context.fetchData(lastToken);

		context.saveData(currentToken, done);
		context.done = done;

		return !done;
	},
	call: async (currentToken, next, nextFrame) =>  {
		const { process, frame } = currentToken;
		const context = process.extern;

		context.saveData(currentToken, true);

		if (!context.hasData(frame)) {
			context.saveData(frame,
				new Dump({values: [], children: [process.extern.dump]}));
		}

		context.saveData(nextFrame, context.fetchData(frame).fetchChild());

		await next();
	},
}, {
	val: function value(currentToken, args) {
		const { process, frame } = currentToken;
		const context = process.extern;
		const dump = context.fetchData(frame);

		context.saveData(currentToken, true);

		return dump.fetchValue(...args);
	},
	run(currentToken, args) {
		const { process, frame } = currentToken;
		const context = process.extern;

		context.saveData(currentToken, true);

		const [craft, source] = args;

		if (!T.Native.String(craft)) {
			U.throwError('craft', 'string');
		}

		const dump = context.fetchData(frame);
		const id =  dump.fetchValue(() => crypto.randomUUID());

		if (!context.hasJob(id)) {
			context.planJob(id, craft, source);

			context.saveData(currentToken, false);
		} else {
			const { ok, error, target } = context.fetchJob(id);

			if (ok) {
				return target;
			} else {
				throw new Error(error);
			}
		}
	},
	async all(currentToken, args) {
		const context = currentToken.process.extern;
		const ret = [];
		let done = true;

		for (const instruction of args) {
			if (Crank.isToken(instruction)) {
				const val = await instruction.execute();

				ret.push(val);

				done &&= context.fetchData(instruction);
			} else {
				ret.push(instruction);
			}
		}

		context.saveData(currentToken, done);

		return ret;
	},
});
