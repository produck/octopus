import { Normalizer, P, S } from '@produck/mold';

import { UUIDSchema as IdSchema } from '../Utils.mjs';
import * as Evaluator from '@produck/octopus-eye';
import { NEW, OK, ERROR, TIMEOUT, ABORTED } from './Status.mjs';

const AtSchema = P.OrNull(P.Integer());
export const StatusSchema = P.Enum([NEW, OK, ERROR, TIMEOUT, ABORTED], 0);
export const MessageSchemna = P.OrNull(P.String());
export const DumpSchema = P.OrNull(Evaluator.DumpSchema);

export const Schema = S.Object({
	id: IdSchema,
	owner: IdSchema,
	model: P.String(),
	dump: DumpSchema,
	createdAt: AtSchema,
	orderedAt: AtSchema,
	finishedAt: AtSchema,
	status: StatusSchema,
	message: MessageSchemna,
	order: P.Any(null),
	artifact: P.Any(null),
});

export const normalize = Normalizer(Schema);
export const normalizeStatus = Normalizer(StatusSchema);
export const normalizeMessage = Normalizer(MessageSchemna);
export const normalizeDump = Normalizer(DumpSchema);
