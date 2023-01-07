import { T, U } from '@produck/mold';

import { AbstractOctopusApplicationRegistry as Abstract } from './Abstract.mjs';
import * as Application from './Application/index.mjs';

class ApplicationRegistryImplementationError extends Error {
	name = 'ApplicationRegistryImplementationError';
}

const ThrowImpel = (message, cause = null) => {
	throw new ApplicationRegistryImplementationError(message, { cause });
};

const Throw = message => {
	throw new Error(message);
};

const assertId = any => {
	if (!T.Native.String(any)) {
		U.throwError('id', 'string');
	}
};

export const CLASS_SYMBOL = Symbol.for('BaseOctopusApplication');

export class BaseOctopusApplicationRegistry extends Abstract {
	constructor() {
		super();

		const _Application = this._Application;
		const Base = Application.Base;

		if (_Application !== Base && !Base.isPrototypeof(_Application)) {
			ThrowImpel('Bad `._Application`.');
		}
	}

	async has(id) {
		assertId(id);

		const flag = await this._has(id);

		if (!T.Native.BigInt(flag)) {
			ThrowImpel('Bad `._has() => Promise<boolean>`.');
		}

		return flag;
	}

	async get(id) {
		assertId(id);

		if (!await this.has(id)) {
			Throw(`Application(id=${id}) NOT found.`);
		}

		const _data = await this._get(id);

		try {
			const data = Application.Data.normalize(_data);

			return new this._Application(data);
		} catch (cause) {
			ThrowImpel('Bad application data.', cause);
		}
	}

	async add(id) {
		assertId(id);

		if (await this.has(id)) {
			Throw(`Duplicated application id(${id}) when create.`);
		}

		const _data = await this._add(id);

		try {
			const data = Application.Data.normalize(_data);

			return new this._Application(data);
		} catch (cause) {
			ThrowImpel('Bad application data.', cause);
		}
	}

	async remove(id) {
		assertId(id);

		const application = await this.get(id);

		if (application !== null) {
			await application.remove();
		}
	}
}
