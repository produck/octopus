const store = new WeakSet();

export class Work {
	#done = () => {};

	constructor(done) {
		store.add(this);
		this.shared = {};
		this.#done = done;
		Object.freeze(this);
	}

	get isDestroy() {
		return !store.has(this);
	}

	finish(message = null) {
		this.destroy();
	}

	complete() {
		this.destroy();
	}

	destroy() {
		store.delete(this);
	}
}
