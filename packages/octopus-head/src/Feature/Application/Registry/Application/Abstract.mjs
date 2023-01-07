function assertImplemented(methodName) {
	throw new Error(`Method '.${methodName}()' MUST be implemented.`);
}

export class AbstractOctopusApplication {
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
