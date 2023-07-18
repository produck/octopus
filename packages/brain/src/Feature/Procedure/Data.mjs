import { Normalizer, P, S, PROPERTY } from '@produck/mold';

const GeneratorFunction = (function* () {})().constructor.constructor;

const OptionsSchemaOptions = {
	script: S.Object({
		main: P.Instance(GeneratorFunction),
		[PROPERTY]: P.Instance(GeneratorFunction),
	}),
	order: P.Function(() => true),
	artifact: P.Function(() => true),
};

export const OptionsSchema = S.Object(OptionsSchemaOptions);
export const normalizeOptions = Normalizer(OptionsSchema);

export const Schema = S.Object({
	name: P.String(),
	...OptionsSchemaOptions,
});

export const normalize = Normalizer(Schema);
