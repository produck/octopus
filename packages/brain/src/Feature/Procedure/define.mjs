import { Definer, Entity } from '@produck/shop';

import { BaseProcedure, assertProcedureName } from './Model.mjs';
import * as Options from './Options.mjs';
import * as Data from './Data.mjs';

export function defineProcedure(_options) {
	const options = Options.normalize(_options);

	return Entity.define({
		name: options.name,
		Model: BaseProcedure,
		define: Definer.Custom({}, {
			async _get(name) {
				assertProcedureName(name);

				if (!await this.has(name)) {
					throw new Error(`Undefined procedure(${name}).`);
				}

				const data = await options.get(name);

				if (data === null) {
					throw new Error(`There MUST be a procedure named "${name}".`);
				}

				return data;
			},
			async _has(name) {
				assertProcedureName(name);

				return await options.has(name);
			},
			async _create(name, ...args) {
				assertProcedureName(name);

				if (await this.has(name)) {
					throw new Error(`Duplicated procedure name(${name}).`);
				}

				return await options.create({ name, ...Data.normalizeOptions(...args) });
			},
		}),
	});
}
