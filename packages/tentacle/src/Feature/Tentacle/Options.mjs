import { Normalizer, P, S } from '@produck/mold';

export const Schema = S.Object({
	pick: P.Function(() => {}),
	free: P.Function(() => {}),
	on: S.Object({
		sync: S.Object({
			ok: P.Function(() => {}),
			error: P.Function(() => {}),
		}),
		config: P.Function(() => {}),
		crash: P.Function(() => {}),
	}),
});

export const normalize = Normalizer(Schema);
