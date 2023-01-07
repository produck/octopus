import * as Application from './Application/index.mjs';
import * as Options from './Options.mjs';
import * as Data from './Data.mjs';
import { BaseOctopusApplicationRegistry } from './Base.mjs';

class ApplicationRegistryDataError extends Error {
	name = 'ApplicationRegistryDataError';
}

const ThrowData = (message, cause = null) => {
	throw new ApplicationRegistryDataError(message, { cause });
};

const ensureDataList = _dataList => {
	try {
		return Data.normalize(_dataList);
	} catch (cause) {
		ThrowData('Bad data list.', cause);
	}
};

const ensureData = _data => {
	try {
		return Application.Data.normalize(_data);
	} catch (cause) {
		ThrowData('Bad data.', cause);
	}
};

export function defineApplicationRegistry(_options) {
	const options = Options.normalize(_options);
	const CLASS_NAME = `${options.name}OctopusApplicationRegistry`;

	return { [CLASS_NAME]: class extends BaseOctopusApplicationRegistry {
		_Application = Application.define({
			name: options.name,
			delete: options.delete,
			PublicKey: options.PublicKey,
		});

		async _has(id) {
			const _dataList = await options.query(id);
			const dataList = ensureDataList(_dataList);

			return dataList.length > 0;
		}

		async _get(id) {
			const _dataList = await options.query(id);
			const dataList = ensureDataList(_dataList);

			if (dataList.length > 1) {
				ThrowData('The list length MUST NOT be > 1.');
			}

			return dataList.length > 0 ? dataList[0] : null;
		}

		async _add(id) {
			const _data = await options.create(id);

			return ensureData(_data);
		}
	} }[CLASS_NAME];
}
