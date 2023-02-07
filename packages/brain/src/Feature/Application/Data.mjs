import { Normalizer, P, S } from '@produck/mold';

import { UUIDSchema as IdSchema } from '../Utils.mjs';

export const Schema = S.Object({
	id: P.OrNull(IdSchema),
	createdAt: P.OrNull(P.Number()),
});

export const normalize = Normalizer(Schema);
