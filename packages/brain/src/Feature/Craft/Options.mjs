import { Normalizer } from '@produck/mold';
import { P, S } from '@produck/mold';

import * as Data from './Data.mjs';

export const EXAMPLE = Data.normalize({ name: 'example' });

export const Schema = S.Object({
	name: P.String('Native'),
	get: P.Function(() => ({ ...EXAMPLE })),
	has: P.Function(() => false),
	create: P.Function(() => ({ ...EXAMPLE })),
});

export const normalize = Normalizer(Schema);
