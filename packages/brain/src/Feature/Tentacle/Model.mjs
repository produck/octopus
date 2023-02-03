import { Definer, Model, _ } from '@produck/shop';

import { normalizeUUID } from '../Utils.mjs';
import * as Data from './Data.mjs';

const Plain = key => [key, function () {
	return _(this)[key];
}];

const At = key => [key, function atGetter() {
	return new Date(_(this)[key]);
}];

const AT_KEYS = ['createdAt', 'visitedAt'];
const PLAIN_KEYS = ['id', 'craft', 'version', 'job'];

export const BaseTentacle = Model.define({
	name: 'Tentacle',
	creatable: true,
	updatable: true,
	deletable: true,
	data: Data.normalize,
	base: Definer.Base(({ Declare }) => {
		Declare.Prototype.notDestroyedRequired()
			.Method('visit', async function () {
				_(this).visitedAt = Date.now();
			})
			.Method('pick', async function (_jobId) {
				_(this).job = normalizeUUID(_jobId);
			})
			.Method('free', async function () {
				_(this).job = null;
			});

		for (const key of PLAIN_KEYS) {
			Declare.Prototype.Accessor(...Plain(key));
		}

		for (const atKey of AT_KEYS) {
			Declare.Prototype.Accessor(...At(atKey));
		}
	}),
	toJSON() {
		const data = _(this);
		const object = {};

		for (const key of PLAIN_KEYS) {
			object[key] = data[key];
		}

		for (const key of AT_KEYS) {
			object[key] = new Date(data[key]);
		}

		return object;
	},
});
