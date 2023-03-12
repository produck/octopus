import * as Options from './Options.mjs';

export class Tentacle {
	#active = false;
	#job = null;
	#options = Options.normalize();

	get active() {
		return this.#active;
	}

	get job() {
		return this.#job;
	}

	async setJob(id) {
		if (this.#job === id) {
			return;
		}

		if (this.#job !== null) {
			await this.#options.free(this.#job);
		}

		if (id !== null) {
			await this.#options.pick(id);
		}
	}

	start() {
		(async function loop(self) {
			if (!self.#active) {
				return;
			}

			await self.#options.update();
			setTimeout(() => loop(self), self.#options.interval());
		})(this);

		return this;
	}

	stop() {
		this.#active = false;

		return this;
	}

	constructor(_server, _options) {
		this.#options = Options.normalize(_options);
	}
}
