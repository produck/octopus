import { Definer, Entity } from '@produck/shop';

import { normalizeUUID as normalizeId } from '../Utils.mjs';
import { BaseApplication } from './Model.mjs';
import * as Options from './Options.mjs';
import * as Data from './Data.mjs';

export function defineApplication(_options = {}) {
	const options = Options.normalize(_options);

	return Entity.define({
		name: options.name,
		Model: BaseApplication,
		define: Definer.Custom({
			async _load(data) {
				return await options.get(data.id);
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
			async _query(filter) {
				return await options.query(filter);
			},
			async _create(_data) {
				const data = Data.normalize(_data);

				return await options.create(data);
			},
		}),
	});
}
