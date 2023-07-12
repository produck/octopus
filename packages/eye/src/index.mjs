import * as Crank from '@produck/crank';
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

const options = {
	Extern: Context,
	abort: (lastInstruction) => {
		return lastInstruction.done;
	},
	call: async (process, nextFrame, next) =>  {
		if (process.top.dump) {
			nextFrame.dump = process.top.fetchChild();
		} else {
			process.top.dump = new Dump({ values: [], children: [process.extern.dump] });
		}

		await next();
	},
};

const executor = {
	value(process, ...args) {
		const { top } = process;

		return top.dump.fetchValue(args);
	},
	run(process, ...args) {
		const { top, extern } = process;

		const [id, craft, source] = args;

		if (!extern.hasJob(id)) {
			extern.planJob(top.dump.fetchValue(id), craft, source);
		} else {
			const { ok, error, target } = extern.fetchJob(id);

			if (ok) {
				return target;
			} else {
				throw new Error(error);
			}
		}
	},
	async all(process, ...args) {
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
};

export const Evaluator = new Crank.Engine(options, executor);
