import * as Options from './Options.mjs';
import { BaseOctopusApplication } from './Base.mjs';

export function defineApplication(_options) {
	const options = Options.normalize(_options);
	const CLASS_NAME = `${options.name}OctopusApplication`;

	return { [CLASS_NAME]: class extends BaseOctopusApplication {
		async _remove() {
			return await options.delete(this.id);
		}

		async _getPublicKeyList() {
			return await options.PublicKey.query(this.id);
		}

		async _appendPublicKey(pem) {
			return await options.PublicKey.create(this.id, pem);
		}

		async _removePublicKey(fingerprint) {
			return await options.PublicKey.delete(this.id, fingerprint);
		}
	} }[CLASS_NAME];
}
