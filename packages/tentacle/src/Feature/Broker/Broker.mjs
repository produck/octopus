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

	#assertReady() {
		if (!this.#ready) {
			throw new Error('Broker is NOT ready.');
		}
	}

	async run(source) {
		this.#assertReady();

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

			Promise.resolve(this.#options.run(work, source)).then(() => {
				if (!work.isDestroyed && !finished) {
					throw new Error('The work is finished without any response.');
				}
			}, reject);
		});

		this.#clear();

		return result;
	}

	async abort() {
		this.#assertReady();

		if (this.#work === null) {
			return;
		}

		this.#ready = false;

		if (this.#options.abort !== null) {
			Work.destroy(this.#work);
			await this.#options.abort(this.#work);
			this.#clear();
		}
	}
}
