import { BaseEnvironment } from './Base.mjs';
import * as Options from './Options.mjs';

export const defineEnvironment = (_options) => {
	const options = Options.normalize(_options);
	const CLASS_NAME = `${options.name}Environment`;

	return { [CLASS_NAME]: class extends BaseEnvironment {
		async _fetch() {
			return await options.fetch();
		}

		async _set(name, value) {
			return await options.set(name, value);
		}
	} }[CLASS_NAME];
};
