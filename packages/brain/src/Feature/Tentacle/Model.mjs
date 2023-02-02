import { Definer, Model } from '@produck/shop';

import * as Data from './Data.mjs';

const NullOrDate = any => any === null ? null : new Date(any);

const Plain = key => [key, function () {
	return _(this)[key];
}];

const At = key => [key, function atGetter() {
	return NullOrDate(_(this)[key]);
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
				await this.save();
			});

		for (const key of PLAIN_KEYS) {
			Declare.Prototype.Accessor(...Plain(key));
		}

		for (const atKey of AT_KEYS) {
			Declare.Prototype.Accessor(...At(atKey));
		}
	}),
});
