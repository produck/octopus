import { Normalizer, P, S, Cust } from '@produck/mold';

import { UUIDSchema } from '../Utils.mjs';

const AtSchema = P.OrNull(P.Integer());
export const StatusCodeSchema = P.Enum([0], 0);
export const MessageSchemna = P.OrNull(P.String());

export const Schema = Cust(S.Object({
	id: UUIDSchema,
	createdAt: AtSchema,
	visitedAt: AtSchema,
	assignedAt: AtSchema,
	startedAt: AtSchema,
	finishedAt: AtSchema,
	statusCode: StatusCodeSchema,
	message: MessageSchemna,
}), (_v, _e, next) => {
	const data = next();


	return data;
});

export const normalize = Normalizer(Schema);
export const normalizeStatusCode = Normalizer(StatusCodeSchema);
export const normalizeMessage = Normalizer(MessageSchemna);
