import { EventEmitter } from 'node:events';

function assertImplemented(methodName) {
	throw new Error(`Method '.${methodName}()' MUST be implemented.`);
}

export class AbstractOctopusEnvironment extends EventEmitter {
	async _fetch() {
		assertImplemented('_fetch');
	}

	async _put() {
		assertImplemented('_put');
	}
}
