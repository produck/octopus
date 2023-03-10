import { EventEmitter } from 'node:events';
import { Definer, Entity } from '@produck/shop';

import { normalizeUUID as normalizeId } from '../Utils.mjs';
import { BaseBrain } from './Model.mjs';
import * as Data from './Data.mjs';
import * as Options from './Options.mjs';
import * as Filter from './Filter.mjs';
import * as Private from './private.mjs';

export function defineBrain(...args) {
	const options = Options.normalize(...args);

	const BrainProxy = Entity.define({
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
			async _get(_id) {
				return await options.get(normalizeId(_id));
			},
			async _create(_data) {
				return await options.create(Data.normalize(_data));
			},
			async _query(_filter = { name: 'All' }) {
				const filter = Filter.normalize(_filter);

				return await options.query[filter.name](filter);
			},
		}),
	});

	Private.set(BrainProxy, {
		current: null,
		active: false,
		emitter: new EventEmitter(),
	});

	return BrainProxy;
}
