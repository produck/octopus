import { Definer, Model, _ } from '@produck/shop';

import * as Data from './Data.mjs';

const AT_KEYS = ['visitedAt', 'createdAt', 'assignedAt', 'startedAt', 'finishedAt'];
const PLAIN_KEYS = ['id', 'status', 'message'];

const NullOrDate = any => any === null ? null : new Date(any);

const Plain = key => [key, function () {
	return _(this)[key];
}];

const At = key => [key, function atGetter() {
	return NullOrDate(_(this)[key]);
}];

export const BaseJob = Model.define({
	name: 'Job',
	creatable: true,
	deletable: true,
	updatable: true,
	data: Data.normalize,
	base: Definer.Base(({ Declare }) => {
		Declare.Prototype.notDestroyedRequired()
			.Method('visit', async function () {
				_(this).visitedAt = Date.now();
				await this.save();
			})
			.Method('assign', async function () {
				if (this.assignedAt !== null) {
					throw new Error('This job has been assigned.');
				}

				_(this).assignedAt = Date.now();
				await this.save();
			})
			.Method('start', async function () {
				if (this.assignedAt === null) {
					throw new Error('This job is NOT assigned.');
				}

				if (this.startedAt !== null) {
					throw new Error('This job has been started.');
				}

				_(this).startedAt = Date.now();
				await this.save();
			})
			.Method('finish', async function (_status, _message = null) {
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
