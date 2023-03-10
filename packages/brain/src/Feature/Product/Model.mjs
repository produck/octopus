import { Cust, Normalizer, U } from '@produck/mold';
import { Definer, Model, _ } from '@produck/shop';

import * as Data from './Data.mjs';
import * as STATUS from './Status.mjs';

const AT_KEYS = ['createdAt', 'orderedAt', 'finishedAt'];

const PLAIN_KEYS = [
	'id', 'owner', 'model',
	'status', 'message',
	'order', 'artifact',
];

const NullOrDate = any => any === null ? null : new Date(any);

const Plain = key => [key, function () {
	return _(this)[key];
}];

const At = key => [key, function atGetter() {
	return NullOrDate(_(this)[key]);
}];

function toJSON() {
	const data = _(this);
	const object = {};

	for (const key of PLAIN_KEYS) {
		object[key] = data[key];
	}

	for (const key of AT_KEYS) {
		object[key] = NullOrDate(data[key]);
	}

	object.dump = _(this).dump;

	return object;
}

export function defineProductBase(Procedure) {
	const DataSchema = Cust(Data.Schema, (_v, _e, next) => {
		const data = next();
		const { model, order, artifact, status, orderedAt } = data;

		const procedure = Procedure.use(model);

		if (orderedAt !== null && !procedure.isOrder(order)) {
			throw new Error('bad ".order".');
		}

		if (status === STATUS.OK && !procedure.isArtifact(artifact)) {
			throw new Error('Bad ".artifact".');
		}

		return data;
	});

	return Model.define({
		name: 'Product',
		creatable: true,
		deletable: true,
		updatable: true,
		data: Normalizer(DataSchema),
		base: Definer.Base(({ Declare }) => {
			Declare.Prototype.notDestroyedRequired()
				.Method('setOrder', function () {
					if (this.orderedAt !== null) {
						throw new Error('This product has been ordered.');
					}

					_(this).orderedAt = Date.now();

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
				.Method('complete', function (_artifact) {
					const data = _(this);

					if (!Procedure.use(data.model).isArtifact(_artifact)) {
						U.throwError('artifact', `${data.model} artifact`);
					}

					data.artifact = _artifact;
					this.finish(STATUS.OK);

					return this;
				})
				.Accessor('dump', function () {
					return _(this).dump;
				}, function (_dump) {
					_(this).dump = Data.normalizeDump(_dump);
				});

			for (const key of PLAIN_KEYS) {
				Declare.Prototype.Accessor(...Plain(key));
			}

			for (const atKey of AT_KEYS) {
				Declare.Prototype.Accessor(...At(atKey));
			}
		}),
		toJSON,
	});
}
