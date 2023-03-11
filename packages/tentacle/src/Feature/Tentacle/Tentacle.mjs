import * as Options from './Options.mjs';

export class Tentacle {
	#active = false;
	#ready = true;
	#job = null;
	#options = Options.normalize();

	get active() {
		return this.#active;
	}

	set ready(flag = true) {
		this.#ready = Boolean(flag);
	}

	get ready() {
		return this.#ready;
	}

	get job() {
		return this.#job;
	}

	async setJob(job) {
		if (this.#job === job) {
			return;
		}

		if (this.#job !== null) {
			await this.#options.free(this.#job);
		}

		if (job !== null) {
			await this.#options.pick(job);
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
