import * as Semver from 'semver';
import { Normalizer, P, S } from '@produck/mold';
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

	isEvaluatable: P.Function(() => false),
});

export const normalize = Normalizer(Schema);
