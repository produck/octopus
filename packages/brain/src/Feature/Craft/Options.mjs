import { Normalizer, T, U } from '@produck/mold';
import { P, S } from '@produck/mold';

function NativeSchema() {
	const registry = {};
	const hasCraft = name => Object.hasOwn(registry, name);

	return {
		get: P.Function(function get(name) {
			if (hasCraft(name)) {
				return { name, policy: registry[name] };
			}

			return null;
		}),
		has: P.Function(function has(name) {
			return hasCraft(name);
		}),
		create: P.Function(function create(_data) {
			const { name, policy } = _data;

			if (hasCraft(name)) {
				throw new Error(`Duplicated craft name(${name}).`);
			}

			const data = { name, policy };

			registry[name] = policy;

			return data;
		}),
	};
}

export const Schema = S.Object({
	name: P.String('Native'),
	...NativeSchema(),
});

export const normalize = Normalizer(Schema);
