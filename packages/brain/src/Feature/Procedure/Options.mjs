import { S, P, Normalizer } from '@produck/mold';

export const Schema = S.Object({
	name: P.StringPattern(/^[A-Z][a-zA-Z]*$/)('Custom'),
	has: P.Function(() => false),
	get: P.Function(() => null),
	query: P.Function(() => []),
	create: P.Function(() => {}),
});

export const normalize = Normalizer(Schema);
