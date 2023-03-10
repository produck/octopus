import { Normalizer, P, S } from '@produck/mold';

import { Work } from './Work.mjs';

const OptionsSchema = S.Object({

});

export class Broker {
	#work = new Work();

	constructor() {
		this.#work.destroy();
		this.#work = null;
	}

	get busy() {
		return this.#work !== null;
	}

	async _procedure() {
		return null;
	}

	async run() {
		if (this.busy) {
			throw new Error('Broker is busy!');
		}

		const work = new Work();
		const target = await this._procedure(work);

		this.#work = null;

		return target;
	}

	async abort() {
		if (this.#work !== null) {
			this.#work.destroy();
		}

		this.#work = null;
	}
}
