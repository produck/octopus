import { Normalizer, P, S } from '@produck/mold';

import { UUIDSchema as IdSchema } from '../Utils.mjs';

export const Schema = S.Object({
	id: P.OrNull(IdSchema),
	owner: P.OrNull(IdSchema),
	pem: P.OrNull(P.String()),
	createdAt: P.OrNull(P.Integer()),
});

export const normalize = Normalizer(Schema);
