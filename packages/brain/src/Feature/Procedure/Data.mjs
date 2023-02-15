import { Normalizer, P, S } from '@produck/mold';

import { ScriptSchema } from '../Evaluator/index.mjs';

const OptionsSchemaOptions = {
	script: ScriptSchema,
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
