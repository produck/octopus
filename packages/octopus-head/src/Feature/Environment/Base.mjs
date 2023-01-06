import { T, U } from '@produck/mold';
import * as Property from './Property.mjs';

import { AbstractOctopusEnvironment } from './Abstract.mjs';

export class BaseOctopusEnvironment extends AbstractOctopusEnvironment {
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

	get(name) {
		this.#assertName(name);

		return this.#cache[name];
	}

	async put(name, value) {
		this.#assertName(name);
		Property.normalizeValue(name, value);
		this.emit('put', name, value);

		try {
			await this._put(name, value);
		} catch (cause) {
			const error = new Error('Put evnironment property failed.', { cause });

			this.emit('put-error', error);
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
