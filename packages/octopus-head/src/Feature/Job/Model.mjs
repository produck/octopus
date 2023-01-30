import { Definer, Model, _ } from '@produck/shop';

import * as Data from './Data.mjs';

const AT_KEYS = ['visited', 'created', 'assigned', 'started', 'finished'];
const PLAIN_KEYS = ['id', 'statusCode', 'message'];

const Plain = key => [key, function () {
	return _(this)[key];
}];

const At = _key => {
	const key = `${_key}At`;

	return [key, function atGetter() {
		const value = _(this)[key];

		return value === null ? null : new Date(value);
	}];
};

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
			.Method('finish', async function (statusCode, message = null) {
				_(this).statusCode = Data.normalizeStatusCode(statusCode);
				_(this).message = Data.normalizeMessage(message);
				_(this).finishedAt = Date.now();

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

		for (const _key of AT_KEYS) {
			const key = `${_key}At`;
			const value = data[key];

			object[key] = value === null ? null : new Date(value);
		}

		return object;
	},
});
