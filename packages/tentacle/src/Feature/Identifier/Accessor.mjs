import { webcrypto as crypto } from 'node:crypto';
import { T, U } from '@produck/mold';
import * as Options from './Options.mjs';
import * as Value from './Value.mjs';

export class IdentifierAccessor {
	#options = Options.normalize();
	#variables = {};
	#value = crypto.randomUUID();

	constructor(_options, _variables = {}) {
		this.#options = Options.normalize(_options);
		this.#variables = _variables;
	}

	get #copy() {
		return { ...this.#variables };
	}

	get value() {
		return this.#value;
	}

	async has() {
		const _flag = await this.#options.has(this.#copy);

		if (!T.Native.Boolean(_flag)) {
			U.throwError('flag', 'boolean');
		}

		return _flag;
	}

	async read() {
		this.#value = Value.normalize(await this.#options.get(this.#copy));
	}

	async write() {
		await this.#options.create(this.#copy);
		await this.read();
	}

	async clean() {
		await this.#options.clean(this.#copy);
	}
}
