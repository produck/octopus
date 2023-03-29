import { T, U } from '@produck/mold';

const store = new WeakSet();

export class Work {
	#done = () => {};

	get isDestroyed() {
		return !store.has(this);
	}

	throw(message = null) {
		if(this.isDestroyed) {
			return;
		}

		if (!T.Native.String(message) && !T.Helper.Null(message)) {
			U.throwError('message', 'string or null');
		}

		this.#done({ ok: false, message });
		Work.destroy(this);
	}

	complete(target) {
		if(this.isDestroyed) {
			return;
		}

		this.#done({ ok: true, target });
		Work.destroy(this);
	}

	static destroy(work) {
		store.delete(work);
	}

	constructor(done, shared) {
		store.add(this);
		this.shared = shared;
		this.#done = done;
		Object.freeze(this);
	}
}
