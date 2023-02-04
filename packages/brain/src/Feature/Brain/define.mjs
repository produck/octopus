import { Definer, Entity } from '@produck/shop';

import { BaseBrain } from './Model.mjs';
import * as Options from './Options.mjs';
import * as Data from './Data.mjs';

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
			async _has(data) {
				return await options.has(data.id);
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
