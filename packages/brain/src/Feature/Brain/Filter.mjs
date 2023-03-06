import { Cust, Normalizer, P, PROPERTY, S } from '@produck/mold';

const descriptors = {
	All: S.Object({
		name: P.Constant('All', true),
	}),
};

const Schema = Cust(S.Object({
	name: P.Enum(Object.keys(descriptors)),
	[PROPERTY]: P.Any(),
}, (_value, _e, next) => {
	const value = next();

	return descriptors[value.name](value);
}));

export const normalize = Normalizer(Schema);
