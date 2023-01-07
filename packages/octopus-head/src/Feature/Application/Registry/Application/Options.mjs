import { S, P, Normalizer } from '@produck/mold';

export const Schema = S.Object({
	name: P.StringPattern(/^[A-Z][a-zA-Z]*$/)('Custom'),
	delete: P.Function(),
	PublicKey: S.Object({
		query: P.Function(),
		create: P.Function(),
		delete: P.Function(),
	}),
});

export const normalize = Normalizer(Schema);
