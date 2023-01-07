import { Normalizer, P, S } from '@produck/mold';

export const Schema = S.Object({
	id: P.String(''),
	createdAt: P.UINT32(Date.now()),
});

export const normalize = Normalizer(Schema);
