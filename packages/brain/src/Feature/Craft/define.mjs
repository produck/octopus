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
			_get(name) {
				assertCraftName(name);

				return options.get(name);
			},
			_has(name) {
				assertCraftName(name);

				return options.has(name);
			},
			_create(_data) {
				return options.create(Data.normalize(_data));
			},
		}),
	});
}
