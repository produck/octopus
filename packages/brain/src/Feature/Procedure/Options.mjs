import { S, P, Normalizer } from '@produck/mold';

import * as Data from './Data.mjs';

export const EXAMPLE = Data.normalize({
	name: 'example',
	script: { *main() {} },
});

export const Schema = S.Object({
	name: P.StringPattern(/^[A-Z][a-zA-Z]*$/)('Native'),
	has: P.Function(() => false),
	get: P.Function(() => null),
	create: P.Function(() => {}),
});

export const normalize = Normalizer(Schema);
