import { Normalizer, P, S, Cust } from '@produck/mold';

import { UUIDSchema as IdSchema } from '../Utils.mjs';

const AtSchema = P.OrNull(P.Integer());
export const StatusSchema = P.Enum([0], 0);
export const MessageSchemna = P.OrNull(P.String());

export const Schema = Cust(S.Object({
	id: IdSchema,
	createdAt: AtSchema,
	visitedAt: AtSchema,
	assignedAt: AtSchema,
	startedAt: AtSchema,
	finishedAt: AtSchema,
	status: StatusSchema,
	message: MessageSchemna,
}), (_v, _e, next) => {
	const data = next();


	return data;
});

export const normalize = Normalizer(Schema);
export const normalizeStatus = Normalizer(StatusSchema);
export const normalizeMessage = Normalizer(MessageSchemna);
