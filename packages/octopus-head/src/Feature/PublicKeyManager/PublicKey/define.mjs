import * as Options from './Options.mjs';
import { BasePublicKey } from './Base.mjs';

export function definePublicKey(_options) {
	const options = Options.normalize(_options);
	const CLASS_NAME = `${options.name}PublicKey`;

	return { [CLASS_NAME]: class extends BasePublicKey {
		async _destroy() {
			return await options.destroy(this.id);
		}
	} }[CLASS_NAME];
}
