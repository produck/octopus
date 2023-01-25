import { webcrypto as crypto } from 'node:crypto';
import * as PublicKey from './PublicKey/index.mjs';

function assertImplemented(methodName) {
	throw new Error(`Method '.${methodName}()' MUST be implemented.`);
}

export class AbstractPublicKeyManager {
	_PublicKey = PublicKey.Base;

	async _id() {
		return crypto.randomUUID();
	}

	async _query() {
		assertImplemented('_query');
	}

	async _has() {
		assertImplemented('_has');
	}

	async _get() {
		assertImplemented('_get');
	}

	async _add() {
		assertImplemented('_add');
	}
}
