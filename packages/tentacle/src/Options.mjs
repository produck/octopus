import * as DuckCLI from '@produck/duck-cli';
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
	command: S.Object({
		options: S.Object({
			start: DuckCLI.Bridge.Feature.OptionsSchema,
			clean: DuckCLI.Bridge.Feature.OptionsSchema,
		}),
		start: P.Function((_o, _e, next) => next()),
		clean: P.Function(() => {}),
	}),
});

export const normalize = Normalizer(Schema);
