import { P, S } from '@produck/mold';

export const Schema = S.Object({
	name: P.String('Custom'),
	run: P.Function(() => {}),
	abort: P.Function(() => {}),
});
