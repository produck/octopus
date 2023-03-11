import { Work } from './Work.mjs';
import * as Options from './Options.mjs';

export class Broker {
	#work = new Work();
	#options = Options.normalize();

	constructor() {
		this.#work.destroy();
		this.#work = null;
	}

	get busy() {
		return this.#work !== null;
	}

	#clear() {
		Work.destroy(this.#work);
		this.#work = null;
	}

	async run() {
		if (this.busy) {
			throw new Error('Broker is busy!');
		}

		const result = await new Promise((resolve, reject) => {
			const shared = this.#options.shared();
			const done = result => resolve(result);
			const work = new Work(done, shared);

			Promise.resolve(this.#options.run(work)).catch(reject);
		});

		this.#clear();

		return result;
	}

	async abort() {
		if (this.#work === null) {
			return;
		}

		await new Promise((resolve, reject) => {
			Promise.resolve(this.#options.abort(this.#work)).then(resolve, reject);
		});

		this.#clear();
	}
}
