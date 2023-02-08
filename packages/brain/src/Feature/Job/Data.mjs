import { Normalizer, P } from '@produck/mold';

import { UUIDSchema as IdSchema } from '../Utils.mjs';
import * as STATUS from './Status.mjs';

const AtSchema = P.OrNull(P.Integer());
export const StatusSchema = P.Enum(STATUS.LIST.map(def => def.value), 0);
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

export const normalizeStatus = Normalizer(StatusSchema);
export const normalizeMessage = Normalizer(MessageSchemna);
