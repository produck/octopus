import * as Application from './Application/index.mjs';

function assertImplemented(methodName) {
	throw new Error(`Method '.${methodName}()' MUST be implemented.`);
}

export class AbstractOctopusApplicationRegistry {
	_Application = Application.Base;

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
