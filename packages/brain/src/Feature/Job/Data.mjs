import { Normalizer, P, S } from '@produck/mold';

import { UUIDSchema as IdSchema } from '../Utils.mjs';
import { NEW, OK, ERROR, TIMEOUT, ABORTED } from './Status.mjs';

const AtSchema = P.OrNull(P.Integer());
export const StatusSchema = P.Enum([NEW, OK, ERROR, TIMEOUT, ABORTED], 0);
export const MessageSchemna = P.OrNull(P.String());

export const SchemaOptions = {
	id: IdSchema,
	product: IdSchema,
	craft: P.String(),
	createdAt: AtSchema,
	visitedAt: AtSchema,
	assignedAt: AtSchema,
	startedAt: AtSchema,
	finishedAt: AtSchema,
	status: StatusSchema,
	message: MessageSchemna,
	source: P.Any(null),
	target: P.Any(null),
};

export const assertAts = () => {};

export const normalize = Normalizer(S.Object(SchemaOptions));
export const normalizeStatus = Normalizer(StatusSchema);
export const normalizeMessage = Normalizer(MessageSchemna);
