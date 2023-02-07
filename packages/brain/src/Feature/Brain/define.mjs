import { Definer, Entity } from '@produck/shop';

import { normalizeUUID as normalizeId } from '../Utils.mjs';
import { BaseBrain } from './Model.mjs';
import * as Data from './Data.mjs';
import * as Options from './Options.mjs';

export function defineBrain(...args) {
	const options = Options.normalize(...args);

	return Entity.define({
		name: options.name,
		Model: BaseBrain,
		define: Definer.Custom({
			async _load(data) {
				return await options.get(data.id);
			},
		}, {
			_external(key) {
				return options.external(key);
			},
			async _has(_id) {
				return await options.has(normalizeId(_id));
			},
			async _get(_data) {
				return await options.get(Data.normalize(_data));
			},
			async _query() {
				return await options.query();
			},
		}),
	});
}
