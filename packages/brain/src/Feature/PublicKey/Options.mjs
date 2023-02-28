import { webcrypto as crypto } from 'node:crypto';
import { S, P, Normalizer } from '@produck/mold';

import * as Data from './Data.mjs';

const EXAMPLE = Data.normalize({
	id: crypto.randomUUID(),
	owner: crypto.randomUUID(),
	pem: '',
	createdAt: Date.now(),
});

const QuerySchema = S.Object({
	All: P.Function(() => []),
	OfOwner: P.Function(() => []),
});

export const Schema = S.Object({
	name: P.StringPattern(/^[A-Z][a-zA-Z]*$/)('Custom'),
	has: P.Function(() => false),
	get: P.Function(() => null),
	query: QuerySchema,
	create: P.Function(() => EXAMPLE),
	destroy: P.Function(() => {}),
});

export const normalize = Normalizer(Schema);
