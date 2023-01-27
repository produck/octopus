import { Normalizer, P, S } from '@produck/mold';

const UUID_REG = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Schema = S.Object({
	id: P.OrNull(P.StringPattern(UUID_REG)()),
	createdAt: P.OrNull(P.Number()),
});

export const normalize = Normalizer(Schema);
