import { Normalizer, P, PROPERTY, S } from '@produck/mold';
import { UUIDSchema } from '../Utils.mjs';

function FilterDescriptor(Schema) {
	return { Schema, normalize: Normalizer(Schema) };
}

const StateSchema = P.OrNull(P.Boolean());

const StateSchemas = {
	ordered: StateSchema,
	started: StateSchema,
	finished: StateSchema,
};

export const Preset = {
	All: FilterDescriptor(S.Object({
		name: P.Constant('All', false),
		...StateSchemas,
	})),
	OfOwner: FilterDescriptor(S.Object({
		name: P.Constant('OfProduct'),
		owner: UUIDSchema,
		...StateSchemas,
	})),
};

const FilterSchema = S.Object({
	name: P.Enum(Object.keys(Preset)),
	[PROPERTY]: P.Any(),
});

export const normalize = Normalizer(FilterSchema);
