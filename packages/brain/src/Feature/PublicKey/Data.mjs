import { Normalizer, P, S } from '@produck/mold';

import { UUIDSchema } from '../Utils.mjs';

export const Schema = S.Object({
	id: P.OrNull(UUIDSchema),
	owner: P.OrNull(UUIDSchema),
	pem: P.OrNull(P.String()),
	createdAt: P.OrNull(P.Integer()),
});

export const normalize = Normalizer(Schema);
