import { EventEmitter } from 'node:events';

function assertImplemented(methodName) {
	throw new Error(`Method '.${methodName}()' MUST be implemented.`);
}

export class AbstractEnvironment extends EventEmitter {
	async _fetch() {
		assertImplemented('_fetch');
	}

	async _set() {
		assertImplemented('_set');
	}
}
