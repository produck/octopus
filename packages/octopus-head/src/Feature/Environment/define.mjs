import { BaseOctopusEnvironment } from './Base.mjs';
import * as Options from './Options.mjs';

export const defineEnvironment = (_options) => {
	const options = Options.normalize(_options);
	const CLASS_NAME = `${options.name}OctopusEnvironment`;

	return { [CLASS_NAME]: class extends BaseOctopusEnvironment {
		async _fetch() {
			return await options.fetch();
		}

		async _put(name, value) {
			return await options.put(name, value);
		}
	} }[CLASS_NAME];
};
