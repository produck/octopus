import { T, U } from '@produck/mold';
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
const PLAIN_KEYS = ['id', 'craft', 'version', 'job', 'ready'];

export const BaseTentacle = Model.define({
	name: 'Tentacle',
	creatable: true,
	updatable: true,
	deletable: true,
	data: Data.normalize,
	base: Definer.Base(({ Declare }) => {
		Declare.Prototype.notDestroyedRequired()
			.Method('pick', function (_jobId) {
				_(this).job = normalizeUUID(_jobId);

				return this;
			})
			.Method('free', function () {
				_(this).job = null;

				return this;
			})
			.Method('setReady', function (flag = true) {
				if (!T.Native.Boolean(flag)) {
					U.throwError('flag', 'boolean');
				}

				_(this).ready = flag;

				return this;
			})
			.Method('toValue', function () {
				const data = _(this);

				return { id: data.id };
			});

		for (const key of PLAIN_KEYS) {
			Declare.Prototype.Accessor(...Plain(key));
		}

		for (const atKey of AT_KEYS) {
			Declare.Prototype.Accessor(...At(atKey));
		}

		Declare.Constructor.Method('fetch', async function (_data) {
			const data = Data.normalize(_data);

			return await this.has(data.id)
				? await this.get(data.id)
				: await this.create(data);
		});
	}),
});
