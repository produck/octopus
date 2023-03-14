import { Normalizer, P, S } from '@produck/mold';

const EMPTY_OBJECT = () => ({});

export const MemberSchemaas = {
	shared: P.Function(EMPTY_OBJECT),
	run: P.Function(() => {}),
	abort: P.OrNull(P.Function()),
};

export const Schema = S.Object(MemberSchemaas);
export const normalize = Normalizer(Schema);
