import { webcrypto as crypto } from 'node:crypto';

export class VM {
	constructor(program, product) {
		const context = new GlobalContext(product);

		this.process = new Process(program, context);
		this.context = new GlobalContext(product);
		this.stack = [];
	}

	call(routine) {
		const scope = { done: false, blocked: false };

		let lastArg;

		this.stack.unshift(scope);

		while (!scope.finished && !scope.done) {
			const { value, done } = routine.next(lastArg);

			scope.done = done;

			if (value.constructor instanceof GeneratorFunction) {
				this.call(value);
			}

			lastArg = null; //from instruction
		}

		this.stack.shift();
	}

	execute() {
		this.call(this.process.main(this.context.product.order));

		return this.context;
	}
}
