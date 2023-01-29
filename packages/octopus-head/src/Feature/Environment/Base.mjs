import { T, U } from '@produck/mold';
import * as Property from './Property.mjs';

import { AbstractEnvironment } from './Abstract.mjs';

export class BaseEnvironment extends AbstractEnvironment {
	#cache = Object.seal(Property.normalize({}));
	#busy = false;

	#assertName(name) {
		if (!T.Native.String(name)) {
			U.throwError('name', 'string');
		}

		if (!Object.hasOwn(Property.PropertySchemas, name)) {
			throw new Error(`Undefined property name(${name}).`);
		}
	}

	get isBusy() {
		return this.#busy;
	}

	get(name) {
		this.#assertName(name);

		return this.#cache[name];
	}

	async set(name, value) {
		this.#assertName(name);
		Property.normalizeValue(name, value);
		this.emit('set', name, value);

		try {
			await this._set(name, value);
		} catch (cause) {
			const error = new Error('Set environment property failed.', { cause });

			this.emit('set-error', error);
		}
	}

	async fetch() {
		let data = this.#cache;
		this.emit('fetch');

		try {
			data = await this._fetch();
		} catch (cause) {
			const error = new Error('Bad `._fetch()`.', { cause });

			this.emit('fetch-error', error);
		}

		try {
			data = Property.normalize(data);
		} catch (cause) {
			const error = new TypeError('Invalid `._fetch() => data`.', { cause });

			this.emit('data-error', error);
		}

		return data;
	}

	start() {
		if (this.#busy) {
			throw new Error('It has been running.');
		}

		this.#busy = true;

		(async function loop(self) {
			if (!self.#busy) {
				return;
			}

			Object.assign(self.#busy, await self.fetch());
			setTimeout(() => loop(self), self.#cache['ENVIRONMENT.REFRESH.INTERVAL']);
		})(this);
	}

	stop() {
		this.#busy = false;
	}
}
