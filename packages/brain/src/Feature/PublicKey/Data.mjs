import { Normalizer, P, S } from '@produck/mold';

import { UUIDSchema as IdSchema } from '../Utils.mjs';

export const Schema = S.Object({
	id: IdSchema,
	owner: IdSchema,
	pem: P.String(),
	createdAt: P.Integer(),
});

export const normalize = Normalizer(Schema);
