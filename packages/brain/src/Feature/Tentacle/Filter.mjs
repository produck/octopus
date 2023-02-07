import { Normalizer, P, PROPERTY, S } from '@produck/mold';

function FilterDescriptor(Schema) {
	return { Schema, normalize: Normalizer(Schema) };
}

const RangeSchemas = {
	busy: P.OrNull(P.Boolean()),
	ready: P.OrNull(P.Boolean()),
	visitedIn: P.OrNull(P.Integer()),
	createdIn: P.OrNull(P.Integer()),
};

export const Preset = {
	All: FilterDescriptor(S.Object({
		name: P.Constant('All', false),
		...RangeSchemas,
	})),
	IsCraft: FilterDescriptor(S.Object({
		name: P.Constant('IsCraft', false),
		craft: P.String(),
		...RangeSchemas,
	})),
};

const FilterSchema = S.Object({
	name: P.Enum(Object.keys(Preset)),
	[PROPERTY]: P.Any(),
});

export const normalize = Normalizer(FilterSchema);
