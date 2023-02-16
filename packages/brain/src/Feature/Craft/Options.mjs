import { Normalizer, P, S } from '@produck/mold';

import * as Data from './Data.mjs';

export const EXAMPLE = Data.normalize({ name: 'example' });

export const Schema = S.Object({
	name: P.StringPattern(/^[A-Z][a-zA-Z]*$/)('Native'),
	has: P.Function(() => false),
	get: P.Function(() => ({ ...EXAMPLE })),
	create: P.Function(() => ({ ...EXAMPLE })),
});

export const normalize = Normalizer(Schema);
