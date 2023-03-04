import { Definer, Entity } from '@produck/shop';

import { normalizeUUID as normalizeId } from '../Utils.mjs';
import { defineProductBase } from './Model.mjs';
import * as Data from './Data.mjs';
import * as Options from './Options.mjs';
import * as Filter from './Filter.mjs';

export function defineProduct(...args) {
	const options = Options.normalize(...args);

	return Entity.define({
		name: options.name,
		Model: defineProductBase(options.Procedure),
		define: Definer.Custom({
			async _load(data) {
				return await options.get(data.id);
			},
			async _save(data) {
				return await options.save(data);
			},
			async _destroy(data) {
				await options.destroy(data.id);
			},
		}, {
			async _has(_id) {
				return await options.has(normalizeId(_id));
			},
			async _get(_id) {
				return await options.get(normalizeId(_id));
			},
			async _query(_filter = { name: 'All' }) {
				const filter = Filter.normalize(_filter);

				return await options.query[filter.name](filter);
			},
			async _create(_data) {
				return await options.create(Data.normalize(_data));
			},
		}),
	});
}
