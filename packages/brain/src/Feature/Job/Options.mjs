import { webcrypto as crypto } from 'node:crypto';
import { S, P, Normalizer } from '@produck/mold';

import * as Data from './Data.mjs';

export const EXAMPLE = Data.normalize({
	id: crypto.randomUUID(),
	product: crypto.randomUUID(),
	craft: 'example',
});

const QuerySchema = S.Object({
	All: P.Function(() => []),
	OfProduct: P.Function(() => []),
});

export const Schema = S.Object({
	name: P.StringPattern(/^[A-Z][a-zA-Z]*$/)('Custom'),
	has: P.Function(() => false),
	get: P.Function(() => null),
	query: QuerySchema,
	create: P.Function(() => EXAMPLE),
	save: P.Function(() => EXAMPLE),
	destroy: P.Function(() => {}),
});

export const normalize = Normalizer(Schema);
