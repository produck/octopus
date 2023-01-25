import { webcrypto as crypto } from 'node:crypto';
import { T, U } from '@produck/mold';

import * as Data from './Data.mjs';
import { AbstractPublicKey } from './Abstract.mjs';

const SIGNATURE_REG = /^[0-9a-f]+$/i;

const PEM = {
	HEAD: '-----BEGIN PUBLIC KEY-----',
	FOOTER: '-----END PUBLIC KEY-----',
};

const CryptoKeyFromPem = pem => {
	const content = pem.substring(PEM.HEAD.length, pem.length - PEM.FOOTER.length);
	const buffer = Buffer.from(content, 'base64');

	return crypto.subtle.importKey('spki', buffer, {
		name: 'RSA-PSS',
		hash: 'SHA-256',
	}, true, ['verify']);
};

export class BasePublicKey extends AbstractPublicKey {
	#data = Data.normalize();

	constructor(data) {
		super();
		this.#data = Data.normalize(data);
	}

	get id() {
		return this.#data.id;
	}

	get createdAt() {
		return new Date(this.#data.createdAt);
	}

	async verify(plain, signature) {
		if (!T.Native.String(plain)) {
			U.throwError('plain', 'string');
		}

		if (!T.Native.String(plain) && !SIGNATURE_REG.test(signature)) {
			U.throwError('signature', 'hex string');
		}

		const key = await CryptoKeyFromPem(this.#data.pem);

		return crypto.subtle.verify('RSA-PSS', key, signature, plain);
	}

	async destroy() {
		await this._destroy();
	}
}
