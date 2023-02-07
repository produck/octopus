import * as Semver from 'semver';
import { Normalizer, P, S } from '@produck/mold';

import { UUIDSchema as IdSchema } from '../Utils.mjs';

const AtSchema = P.Integer();

export const Schema = S.Object({
	id: IdSchema,
	craft: P.String(),
	version: S.Value(Semver.valid, 'semver string', () => '0.0.0'),
	ready: P.Boolean(false),
	job: P.OrNull(IdSchema),
	createdAt: AtSchema,
	visitedAt: AtSchema,
});

export const normalize = Normalizer(Schema);
