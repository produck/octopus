import { Definer, Entity } from '@produck/shop';

import { BaseTentacle } from './Model.mjs';
import * as Options from './Options.mjs';
import * as Filter from './Filter.mjs';

const FILTER_ALL = Filter.Preset.All.normalize();

export function defineTentacle(_options = {}) {
	const options = Options.normalize(_options);

	return Entity.define({
		name: options.name,
		Model: BaseTentacle,
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
			async _has(data) {
				return await options.has(data.id);
			},
			async _get(data) {
				return await options.get(data.id);
			},
			async _query(_filter = FILTER_ALL) {
				const { name } = Filter.normalize(_filter);
				const filterOptions = Filter.Preset[name].normalize(_filter);

				return await options.query[name](filterOptions);
			},
			async _create(data) {
				return await options.create(data);
			},
		}),
	});
}
