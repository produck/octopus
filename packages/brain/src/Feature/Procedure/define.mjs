import { Entity } from '@produck/shop';

import { BaseProcedure } from './Model.mjs';
import * as Options from './Options.mjs';

export function defineProcedure(_options) {
	const options = Options.normalize(_options);

	return Entity.define({
		name: options.name,
		Model: BaseProcedure,
	});
}
