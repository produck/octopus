import { Normalizer, P, S } from '@produck/mold';

export const Schema = S.Object({
	name: P.StringPattern(/^[A-Z][a-zA-Z]*$/)('Custom'),
	destroy: P.Function(() => {}),
});

export const normalize = Normalizer(Schema);
