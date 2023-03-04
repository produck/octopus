import { Cust, Normalizer, P, PROPERTY, S } from '@produck/mold';
import { UUIDSchema } from '../Utils.mjs';

const descriptors = {
	All: S.Object({
		name: P.Constant('All', true),
	}),
	OfOwner: S.Object({
		name: P.Constant('OfOwner', true),
		owner: UUIDSchema,
	}),
};

const Schema = Cust(S.Object({
	name: P.Enum(Object.keys(descriptors)),
	[PROPERTY]: P.Any(),
}), (_value, _e, next) => {
	const value = next();

	return descriptors[value.name](value);
});

export const normalize = Normalizer(Schema);
