import { Definer, Model, _ } from '@produck/shop';

import * as Data from './Data.mjs';

const AT_KEYS = ['createdAt', 'orderedAt', 'startedAt', 'finishedAt'];
const PLAIN_KEYS = ['id', 'owner', 'model', 'status', 'message'];

const NullOrDate = any => any === null ? null : new Date(any);

const Plain = key => [key, function () {
	return _(this)[key];
}];

const At = key => [key, function atGetter() {
	return NullOrDate(_(this)[key]);
}];

export const BaseProduct = Model.define({
	name: 'Product',
	creatable: true,
	deletable: true,
	updatable: true,
	data: Data.normalize,
	base: Definer.Base(({ Declare }) => {
		Declare.Prototype.notDestroyedRequired()
			.Method('order', async function () {
				if (this.orderedAt !== null) {
					throw new Error('This product has been ordered.');
				}

				_(this).orderedAt = Date.now();
				await this.save();
			})
			.Method('start', async function () {
				if (this.orderedAt === null) {
					throw new Error('This product is NOT ordered.');
				}

				if (this.startedAt !== null) {
					throw new Error('This product has been started.');
				}

				_(this).startedAt = Date.now();
				await this.save();
			})
			.Method('finish', async function (_status, _message) {
				const status = Data.normalizeStatus(_status);
				const message = Data.normalizeMessage(_message);

				const _this = _(this);

				_this.status = status;
				_this.message = message;
				_this.finishedAt = Date.now();

				await this.save();
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
			object[key] = NullOrDate(data[key]);
		}

		return object;
	},
});
