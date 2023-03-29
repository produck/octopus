import { Work } from './Work.mjs';
import * as Options from './Options.mjs';

export class Broker {
	#work = new Work();
	#options = Options.normalize();
	#ready = true;

	constructor(...args) {
		this.#options = Options.normalize(...args);
		Work.destroy(this.#work);
		this.#work = null;
	}

	get busy() {
		return this.#work !== null;
	}

	get ready() {
		return this.#ready;
	}

	#clear() {
		Work.destroy(this.#work);
		this.#work = null;
		this.#ready = true;
	}

	async run(source) {
		if (this.busy) {
			throw new Error('Broker is busy!');
		}

		const result = await new Promise((resolve, reject) => {
			let finished = false;

			const done = result => {
				finished = true;
				resolve(result);
			};

			const shared = this.#options.shared();
			const work = new Work(done, shared);

			this.#work = work;

			Promise.resolve(this.#options.run(work, source)).catch(reject).then(() => {
				if (!finished) {
					throw new Error('The work is finished without any response.');
				}
			});
		});

		this.#clear();

		return result;
	}

	async abort() {
		if (this.#work === null) {
			return;
		}

		if (this.#options.abort === null) {
			this.#ready = false;
		} else {
			await this.#options.abort(this.#work);
			this.#clear();
		}
	}
}
