import { Definer, Entity } from '@produck/shop';

import { BaseApplication } from './Model.mjs';
import * as Options from './Options.mjs';

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
			async _has(data) {
				return await options.has(data.id);
			},
			async _get(data) {
				return await options.get(data.id);
			},
			async _query(filter) {
				return await options.query(filter);
			},
			async _create(data) {
				return await options.create(data);
			},
		}),
	});
}
