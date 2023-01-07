import * as PublicKeyRegistry from './PublicKey/index.mjs';

function assertImplemented(methodName) {
	throw new Error(`Method '.${methodName}()' MUST be implemented.`);
}

export class AbstractOctopusApplication {
	_PublicKeyRegistry = PublicKeyRegistry.Base;

	async _remove() {
		assertImplemented('_remove');
	}

	async _getPublicKeyList() {
		return [];
	}

	async _appendPublicKey() {
		assertImplemented('_appendPublicKey');
	}

	async _removePublicKey() {
		assertImplemented('_removePublicKey');
	}
}
