function assertImplemented(methodName) {
	throw new Error(`Method '.${methodName}()' MUST be implemented.`);
}

export class AbstractPublicKey {
	async _destroy() {
		assertImplemented();
	}
}
