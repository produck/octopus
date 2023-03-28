import * as Semver from 'semver';
import { Normalizer, P, S } from '@produck/mold';
import * as DuckCLI from '@produck/duck-cli';
import * as Feature from './Feature/index.mjs';

export const Schema = S.Object({
	name: P.String('DefaultName'),
	version: S.Value(Semver.valid, 'semver string', () => '0.0.0'),

	Application: Feature.Application.Options.Schema,
	Brain: Feature.Brain.Options.Schema,
	Craft: Feature.Craft.Options.Schema,
	Environment: Feature.Environment.Options.Schema,
	Job: Feature.Job.Options.Schema,
	Procedure: Feature.Procedure.Options.Schema,
	Product: Feature.Product.Options.Schema,
	PublicKey: Feature.PublicKey.Options.Schema,
	Tentacle: Feature.Tentacle.Options.Schema,

	observer: S.Object({
		lock: P.Function(() => false),
		unlock: P.Function(() => {}),
	}),

	cli: S.Object({
		options: S.Object({
			global: DuckCLI.Bridge.Feature.OptionsSchema,
			start: DuckCLI.Bridge.Feature.OptionsSchema,
			install: DuckCLI.Bridge.Feature.OptionsSchema,
		}),
		start: P.Function((_opts, _kit, next) => next()),
		install: P.Function((_opts, _kit, next) => next()),
		extend: P.Function(() => {}),
	}),

	web: S.Object({
		external: P.Function(() => () => {}),
	}),
});

export const normalize = Normalizer(Schema);
