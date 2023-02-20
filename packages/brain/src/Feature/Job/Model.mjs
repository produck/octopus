import { Cust, Normalizer, U } from '@produck/mold';
import { Definer, Model, _ } from '@produck/shop';

import * as Data from './Data.mjs';
import * as STATUS from './Status.mjs';

const AT_KEYS = [
	'visitedAt', 'createdAt', 'startedAt', 'finishedAt',
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
	const DataSchema = Cust(Data.Schema, (_v, _e, next) => {
		const data = next();
		const { craft: craftName, target, source, status } = data;

		Data.assertAts(data);

		const craft = Craft.use(craftName);

		if (!craft.isSource(source)) {
			throw new Error('Bad ".source".');
		}

		if (status === STATUS.OK && !craft.isTarget(target)) {
			throw new Error('Bad ".target".');
		}

		return data;
	});

	return Model.define({
		name: 'Job',
		creatable: true,
		deletable: true,
		updatable: true,
		data: Normalizer(DataSchema),
		base: Definer.Base(({ Declare }) => {
			Declare.Prototype.notDestroyedRequired()
				.Method('visit', function () {
					_(this).visitedAt = Date.now();

					return this;
				})
				.Method('start', function () {
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
					const data = _(this);

					if (!Craft.use(data.craft).isTarget(_target)) {
						U.throwError('target', `${data.craft} target`);
					}

					data.target = _target;
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
