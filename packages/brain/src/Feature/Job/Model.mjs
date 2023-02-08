import { Cust, Normalizer, P, S, U } from '@produck/mold';
import { Definer, Model, _, _Data } from '@produck/shop';

import * as Data from './Data.mjs';
import * as STATUS from './Status.mjs';

const AT_KEYS = [
	'visitedAt', 'createdAt', 'assignedAt', 'startedAt', 'finishedAt',
];

const PLAIN_KEYS = [
	'id', 'product',
	'craft', 'source', 'target',
	'status', 'message',
];

const NullOrDate = any => any === null ? null : new Date(any);

const Plain = key => [key, function () {
	return _(this)[key];
}];

const At = key => [key, function atGetter() {
	return NullOrDate(_(this)[key]);
}];

export function defineJobModel(Craft) {
	const DataSchema = Cust(S.Object({
		...Data.SchemaOptions,
		craft: P.Enum(Craft.nameList, null),
	}), (_v, _e, next) => {
		const data = next();
		const craft = Craft.get(data.craft);

		if (!craft.isSource(data.source)) {
			U.throwError('.source', `${data.craft} source.`);
		}

		if (!craft.isTarget(data.target)) {
			U.throwError('.target', `${data.craft} target.`);
		}

		Data.assertAts(data);

		return data;
	});

	return Model.define({
		name: 'Job',
		creatable: true,
		deletable: true,
		updatable: true,
		data: Normalizer(DataSchema),
		base: Definer.Base(({ Declare, Throw }) => {
			Declare.Prototype.notDestroyedRequired()
				.Method('visit', function () {
					_(this).visitedAt = Date.now();

					return this;
				})
				.Method('assign', function () {
					if (this.assignedAt !== null) {
						throw new Error('This job has been assigned.');
					}

					_(this).assignedAt = Date.now();

					return this;
				})
				.Method('start', function () {
					if (this.assignedAt === null) {
						throw new Error('This job is NOT assigned.');
					}

					if (this.startedAt !== null) {
						throw new Error('This job has been started.');
					}

					_(this).startedAt = Date.now();

					return this;
				})
				.Method('finish', function (_status, _message = null) {
					const status = Data.normalizeStatus(_status);
					const message = Data.normalizeMessage(_message);

					const data = _(this);

					data.status = status;
					data.message = message;
					data.finishedAt = Date.now();

					return this;
				})
				.Method('complete', function (_target) {
					const craft = Craft.get(this.craft);

					if (!craft.isTarget(_target)) {
						Throw('Bad target');
					}

					_(this).target = _target;
					this.finish(STATUS.OK);

					return this;
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
}
