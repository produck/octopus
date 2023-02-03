import * as Semver from 'semver';
import { Normalizer, P, S } from '@produck/mold';

import { UUIDSchema } from '../Utils.mjs';

const AtSchema = P.OrNull(P.Integer());

export const Schema = S.Object({
	id: UUIDSchema,
	name: P.String(),
	version: S.Value(Semver.valid, 'semver string'),
	createdAt: AtSchema,
	visitedAt: AtSchema,
});

export const normalize = Normalizer(Schema);
