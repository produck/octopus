import * as PublicKey from './PublicKey/index.mjs';
import { AbstractPublicKeyManager } from './Abstract.mjs';

export class BasePublicKeyManager extends AbstractPublicKeyManager {
	async query() {

	}

	async has(id) {
		const _flag = await this._has(id);
	}

	async get(id) {

	}

	async add(pem) {
		const id = await this._id();
		const _data = await this._add({ id, pem, createdAt: Date.now });

		try {
			return new this._PublicKey(PublicKey.Data.normalize(_data));
		} catch (error) {

		}

	}

	async remove(id) {

	}
}
