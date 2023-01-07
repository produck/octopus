import * as crypto from 'node:crypto';
import { Normalizer, P, S, T, U } from '@produck/mold';

import { AbstractOctopusApplication } from './Abstract.mjs';
import * as Data from './Data.mjs';

export const KeyListSchema = S.Array({ items: P.String() });
export const normalizeKeyList = Normalizer(KeyListSchema);

const SIGNATURE_REG = /^[0-9a-f]+$/i;

export class BaseOctopusApplication extends AbstractOctopusApplication {
	#data = Object.seal(Data.normalize({}));
	PublicKey = new this._PublicKeyRegistry(this);

	constructor(data) {
		super();
		Object.assign(this.#data, Data.normalize(data));
	}

	get id() {
		return this.#data.id;
	}

	async getPublicKeyList() {
		return normalizeKeyList(await this._getPublicKeyList());
	}

	async verify(plain, signature) {
		if (!T.Native.String(plain)) {
			U.throwError('plain', 'string');
		}

		if (!T.Native.String(plain) && !SIGNATURE_REG.test(signature)) {
			U.throwError('signature', 'hex string');
		}

		for (const publicKey of await this.getPublicKeyList()) {
			const validator = crypto.createVerify('SHA256');

			validator.update(plain);

			if (validator.verify(publicKey, signature, 'hex')) {
				return true;
			}
		}

		return false;
	}

	async remove() {
		await this._remove();
	}

	async appendPublicKey(pem) {
		await this._appendPublicKey(pem);
	}

	async removePublicKey(fingerprint) {
		await this._removePublicKey(fingerprint);
	}
}
