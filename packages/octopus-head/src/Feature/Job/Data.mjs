import { Normalizer, P, S, Cust } from '@produck/mold';

const AtSchema = P.OrNull(P.Integer(), true);
export const StatusCodeSchema = P.Enum([0], 0);
export const MessageSchemna = P.OrNull(P.String(), false);

export const Schema = Cust(S.Object({
	id: P.StringPattern(/^[0-9a-f]{64}$/i, 'HEX64')(),
	createdAt: AtSchema,
	visitedAt: AtSchema,
	assignedAt: AtSchema,
	startedAt: AtSchema,
	finishedAt: AtSchema,
	archivedAt: AtSchema,
	statusCode: StatusCodeSchema,
	message: MessageSchemna,
}), (_v, _e, next) => {
	const data = next();


	return data;
});

export const normalize = Normalizer(Schema);
export const normalizeStatusCode = Normalizer(StatusCodeSchema);
export const normalizeMessage = Normalizer(MessageSchemna);
