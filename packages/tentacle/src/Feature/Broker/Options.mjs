import { Normalizer, P, S } from '@produck/mold';

const EMPTY_OBJECT = () => ({});

export const MemberSchemaas = {
	shared: P.Function(EMPTY_OBJECT),
	run: P.Function(() => {}),
	abort: P.Function(() => {}),
};

export const Schema = S.Object({
	name: P.String('Custom'),
	...MemberSchemaas,
});

export const normalize = Normalizer(Schema);
