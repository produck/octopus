import { Normalizer, P, S } from '@produck/mold';

function* EMPTY_WORKFLOW() {}

export const Schema = S.Object({
	name: P.String(),
	workflow: P.Instance(EMPTY_WORKFLOW),
});

export const normalize = Normalizer(Schema);
