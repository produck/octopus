import { Normalizer, P, PROPERTY, S } from '@produck/mold';
import { UUIDSchema } from '../Utils.mjs';

function FilterDescriptor(Schema) {
	return { Schema, normalize: Normalizer(Schema) };
}

const FilterAllSchema = S.Object({ name: P.Constant('All', false) });

const FilterOfOwnerSchemna = S.Object({
	name: P.Constant('OfOwner'),
	owner: UUIDSchema,
});

export const Preset = {
	All: FilterDescriptor(FilterAllSchema),
	OfOwner: FilterDescriptor(FilterOfOwnerSchemna),
};

const FilterSchema = S.Object({
	name: P.Enum(Object.keys(Preset)),
	[PROPERTY]: P.Any(),
});

export const normalize = Normalizer(FilterSchema);
