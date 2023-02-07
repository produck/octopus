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

export function defineCraft(_options) {
	const options = Options.normalize(_options);

	return Entity.define({
		name: options.name,
		Model: BaseCraft,
		define: Definer.Custom({}, {
			async _get(name) {
				assertCraftName(name);

				return await options.get(name);
			},
			async _has(name) {
				assertCraftName(name);

				return await options.has(name);
			},
			async _create(_data) {
				return await options.create(Data.normalize(_data));
			},
		}),
	});
}
