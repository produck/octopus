import { Normalizer, P, S } from '@produck/mold';

import { UUIDSchema } from '../Utils.mjs';

const AtSchema = P.OrNull(P.Integer());
export const StatusSchema = P.Enum([0], 0);
export const MessageSchemna = P.OrNull(P.String());

export const Schema = S.Object({
	id: UUIDSchema,
	owner: UUIDSchema,
	model: AtSchema,
	createdAt: AtSchema,
	orderedAt: AtSchema,
	startedAt: AtSchema,
	finishedAt: AtSchema,
	status: StatusSchema,
	message: MessageSchemna,
});

export const normalize = Normalizer(Schema);
export const normalizeStatus = Normalizer(StatusSchema);
export const normalizeMessage = Normalizer(MessageSchemna);
