import { webcrypto as crypto } from 'node:crypto';
import { T, U } from '@produck/mold';
import * as Options from './Options.mjs';
import * as Value from './Value.mjs';

export class IdentifierAccessor {
	#options = Options.normalize();
	#variables = {};
	#value = crypto.randomUUID();

	constructor(...args) {
		this.#options = Options.normalize(...args.splice(0, 1));
		this.#variables = args.splice(0, 1)[0];
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
