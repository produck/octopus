import * as Semver from 'semver';
import { Normalizer, P, S } from '@produck/mold';

import { UUIDSchema } from '../Utils.mjs';

const AtSchema = P.OrNull(P.Integer());

export const Schema = S.Object({
	id: UUIDSchema,
	craft: P.String(),
	version: S.Value(Semver.valid, 'semver string', () => '0.0.0'),
	job: P.OrNull(UUIDSchema),
	createdAt: AtSchema,
	visitedAt: AtSchema,
});

export const normalize = Normalizer(Schema);
