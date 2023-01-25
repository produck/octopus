import { Normalizer, P, S } from '@produck/mold';

export const Schema = S.Object({
	id: P.String(''),
	pem: P.String(''),
	createdAt: P.Number(0),
});

export const normalize = Normalizer(Schema);
