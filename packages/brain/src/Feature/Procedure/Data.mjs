import { Normalizer, P, S } from '@produck/mold';

export const Schema = S.Object({
	name: P.String(),
	program: P.Instance({ *main() {} }),
});

export const normalize = Normalizer(Schema);
