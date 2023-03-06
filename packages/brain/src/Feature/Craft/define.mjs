import { EventEmitter } from 'node:events';
import { Definer, Entity } from '@produck/shop';

import { BaseCraft, assertCraftName } from './Model.mjs';
import * as Data from './Data.mjs';
import * as Options from './Options.mjs';
import * as Private from './private.mjs';

export function defineCraft(...args) {
	const options = Options.normalize(...args);

	const CraftProxy = Entity.define({
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
			async _create(name, ...args) {
				assertCraftName(name);

				if (await this.has(name)) {
					throw new Error(`Duplicated craft name(${name}).`);
				}

				return await options.create({ name, ...Data.normalizeOptions(...args) });
			},
		}),
	});

	Private.set(CraftProxy, {
		registry: {},
		emitter: new EventEmitter(),
	});

	return CraftProxy;
}
