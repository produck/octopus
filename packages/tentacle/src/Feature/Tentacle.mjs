import { EventEmitter } from 'node:events';

export class Tentacle extends EventEmitter {
	#active = false;
	#job = false;
	#config = null;
	#ready = true;

	setReady(flag = true) {
		this.#ready = Boolean(flag);
	}

	get ready() {
		return this.#ready;
	}

	get busy() {
		return this.#job !== null;
	}

	async sync() {

	}

	start() {

	}

	stop() {

	}
}
