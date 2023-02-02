import { Normalizer, P, PROPERTY, S } from '@produck/mold';
import { UUIDSchema } from '../Utils.mjs';

function FilterDescriptor(Schema) {
	return { Schema, normalize: Normalizer(Schema) };
}

const FilterAllSchema = S.Object({ name: P.Constant('All', false) });

const FilterOfProductSchemna = S.Object({
	name: P.Constant('OfProduct'),
	product: UUIDSchema,
});

const FilterOfTentacleSchemna = S.Object({
	name: P.Constant('OfTentacle'),
	tentacle: UUIDSchema,
});

export const Preset = {
	All: FilterDescriptor(FilterAllSchema),
	OfProduct: FilterDescriptor(FilterOfProductSchemna),
	OfTentacle: FilterDescriptor(FilterOfTentacleSchemna),
};

const FilterSchema = S.Object({
	name: P.Enum(Object.keys(Preset)),
	[PROPERTY]: P.Any(),
});

export const normalize = Normalizer(FilterSchema);
