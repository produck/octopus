function assertImplemented(methodName) {
	throw new Error(`Method '.${methodName}()' MUST be implemented.`);
}

export class AbstractOctopusJob {
	get _strict() {
		return true;
	}

	async _load() {
		assertImplemented('_load');
	}

	async _save() {
		assertImplemented('_save');
	}
}
