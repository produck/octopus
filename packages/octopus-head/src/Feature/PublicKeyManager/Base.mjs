import { AbstractPublicKeyManager } from './Abstract.mjs';

export class BasePublicKeyManager extends AbstractPublicKeyManager {
	/** @type {import('../Base.mjs').BaseOctopusApplication} */
	#application = null;

	constructor(application) {
		super();
		this.#application = application;
	}

	query() {

	}

	has(fingerprint) {
		const _flag = this._has(fingerprint);
	}

	get(fingerprint) {

	}

	add(pem) {

	}

	remove(fingerprint) {

	}
}
