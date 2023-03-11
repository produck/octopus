import { Normalizer, P, S } from '@produck/mold';

export const Schema = S.Object({
	pick: P.Function(() => {}),
	free: P.Function(() => {}),
	update: P.Function(() => {}),
	interval: P.Function(() => 0),
});

export const normalize = Normalizer(Schema);
