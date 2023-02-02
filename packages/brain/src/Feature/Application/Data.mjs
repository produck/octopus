import { Normalizer, P, S } from '@produck/mold';

import { UUIDSchema } from '../Utils.mjs';

export const Schema = S.Object({
	id: P.OrNull(UUIDSchema),
	createdAt: P.OrNull(P.Number()),
});

export const normalize = Normalizer(Schema);
