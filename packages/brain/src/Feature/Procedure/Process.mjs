import { webcrypto as crypto } from 'node:crypto';
import { Normalizer, P } from '@produck/mold';

const WorkflowSchema = P.Instance((function* (){}).constructor);
const normalizeWorkflow = Normalizer(WorkflowSchema);

const GeneratorFunction = (function* () {}).constructor;

export class GlobalContext {
	value = { queue: [], index: 0 };
	job = { finished: {}, creating: {} };

	constructor(product) {
		this.product = product;
	}

	fetchVariable(value) {
		if (this.value.index < this.value.queue.length) {
			return this.value.queue[this.value.index++];
		}

		return this.value.queue[this.value.index++] = value;
	}

	isJobFinished(id) {
		return Object.hasOwn(this.job.finished, id);
	}

	getJobTarget(id) {
		return this.job.finished[id];
	}

	block() {

	}
}

export class VM {
	constructor(program, product) {
		const context = new GlobalContext(product);

		this.process = new Process(program, context);
		this.context = new GlobalContext(product);
		this.stack = [];
	}

	load() {

	}

	call(thread) {
		const scope = {
			done: false,
			blocked: false,
		};

		this.stack.unshift(scope);

		while (!scope.finished && !scope.done) {
			const { value, done } = thread.next();

			scope.done = done;

			if (value.constructor instanceof GeneratorFunction) {
				this.call(value);
			}
		}

		this.stack.shift();
	}

	execute() {
		this.process.main(this.context.product.order);
	}
}

export class Process {
	#global = new GlobalContext();

	constructor(program, globalContext = new GlobalContext()) {
		Object(this, program);
		this.#global = globalContext;
	}

	ref(value) {
		return this.#global.fetchVariable(value);
	}

	run(craft, source) {
		const id = this.ref(crypto.randomUUID());

		if (this.#global.isJobFinished(id)) {
			return this.#global.getJobTarget(id);
		}

		return;
	}

	*all(routineList = []) {
		for (const thread of routineList) {
			yield thread;
		}
	}
}
