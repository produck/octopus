import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import { webcrypto as crypto } from 'node:crypto';
import * as DuckCLI from '@produck/duck-cli';
import { Normalizer, P, S } from '@produck/mold';
import * as semver from 'semver';

import * as Broker from './Feature/Broker/index.mjs';
import * as Identifier from './Feature/Identifier/index.mjs';

/** @param any {string} */
const isSemver = any => Boolean(semver.valid(any));

export const VersionSchema = S.Value(isSemver, 'semver', () => '0.0.0');

export const Schema = S.Object({
	id: S.Object({ ...Identifier.Options.SchemaItems }, () => {
		const idPath = workspace => path.resolve(workspace, 'id');

		return {
			has: async ({ workspace }) => {
				try {
					await fs.access(idPath(workspace));

					return true;
				} catch {
					return false;
				}
			},
			get: async ({ workspace }) => {
				const _id = await fs.readFile(idPath(workspace), 'utf-8');

				return Identifier.Value.normalize(_id.trim());
			},
			create: async ({ workspace }) => {
				await fs.writeFile(idPath(workspace), crypto.randomUUID(), 'utf-8');
			},
			clean: async ({ workspace }) => {
				await fs.rm(idPath(workspace));
			},
		};
	}),
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
