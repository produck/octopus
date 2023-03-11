import { Normalizer, P, S } from '@produck/mold';
import * as semver from 'semver';

import * as Broker from './Feature/Broker/index.mjs';

/** @param any {string} */
const isSemver = any => Boolean(semver.valid(any));

export const VersionSchema = S.Value(isSemver, 'semver', () => '0.0.0');

export const Schema = S.Object({
	craft: P.String('example'),
	version: VersionSchema,
	...Broker.Options.MemberSchemaas,
});

export const normalize = Normalizer(Schema);
