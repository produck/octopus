import { T, U } from '@produck/mold';
import { Definer, Entity } from '@produck/shop';

import { BaseCraft } from './Model.mjs';
import * as Data from './Data.mjs';
import * as Options from './Options.mjs';

function assertCraftName(any) {
	if (!T.Native.String(any)) {
		U.throwError('name', 'string');
	}
}

export function defineCraft(...args) {
	const options = Options.normalize(...args);

	return Entity.define({
		name: options.name,
		Model: BaseCraft,
		define: Definer.Custom({}, {
			async _get(name) {
				assertCraftName(name);

				if (!await this.has(name)) {
					throw new Error(`Undefined craft(${name}).`);
				}

				const data = await options.get(name);

				if (data === null) {
					throw new Error(`There MUST be a craft named "${name}".`);
				}

				return data;
			},
			async _has(name) {
				assertCraftName(name);

				return await options.has(name);
			},
			async _create(name, _options) {
				assertCraftName(name);

				if (await this.has(name)) {
					throw new Error(`Duplicated craft name(${name}).`);
				}

				return await options.create({ name, ...Data.normalizeOptions(_options) });
			},
		}),
	});
}
