import { EventEmitter } from 'node:events';
import { Normalizer, P } from '@produck/mold';
import { Definer, Model, _ } from '@produck/shop';

import * as Data from './Data.mjs';

const Plain = key => [key, function () {
	return _(this)[key];
}];

const At = key => [key, function atGetter() {
	return new Date(_(this)[key]);
}];

const EMITTER_PROXY_KEYS = ['on', 'off', 'once'];
const EXTERNAL_KEYS = ['MAX_ALIVE_GAP', 'WATCHING_INTERVAL'];
const AT_KEYS = ['createdAt', 'visitedAt'];
const PLAIN_KEYS = ['id', 'name', 'version'];
const byIdInASC = (brainA, brainB) => brainA.id - brainB.id;

const ExternalValueSchema = P.Integer();
const normalizeExternalValue = Normalizer(ExternalValueSchema);

const ExternalAccessor = key => [key, function getItem() {
	return normalizeExternalValue(this._external(key));
}];

const defineBase = Definer.Base(({ Declare, Throw }) => {
	for (const key of PLAIN_KEYS) {
		Declare.Prototype.Accessor(...Plain(key));
	}

	for (const key of AT_KEYS) {
		Declare.Prototype.Accessor(...At(key));
	}

	const EmitterMethodProxy = key => [key, function proxy(...args) {
		emitter[key](...args);

		return this;
	}];

	for (const key of EMITTER_PROXY_KEYS) {
		Declare.Constructor.Method(...EmitterMethodProxy(key));
	}

	for (const key of EXTERNAL_KEYS) {
		Declare.Constructor.Accessor(...ExternalAccessor(key));
	}

	let current = null, active = false, emitter = new EventEmitter();

	async function boot (_selfData) {
		if (active) {
			throw new Error('A brain is alive currently.');
		}

		active = true;

		const self = await this.get(Data.normalize(_selfData));

		current = self;

		(async function watch(Brain) {
			if (current !== self) {
				return;
			}

			try {
				await self.load();

				const list = await Brain.query();

				if (list.length < 1) {
					Throw.ImplementError('There SHOULD be 1 brain at least.');
				}

				const aliveList = list
					.filter(brain => self.visitedAt - brain.visitedAt < Brain.MAX_ALIVE_GAP)
					.sort(byIdInASC);

				if (aliveList.length > 0 && aliveList[0].id === self.id) {
					emitter.emit('grant');
				}
			} catch (error) {
				emitter.emit('watch-error', error);
			}

			setTimeout(() => watch(Brain), Brain.WATCHING_INTERVAL);
		})(this);

		return this;
	}

	function halt() {
		active = false;
		current = null;

		return this;
	}

	Declare.Constructor
		.Accessor('isActive', () => active)
		.Accessor('current', () => current)
		.Method('boot', boot)
		.Method('halt', halt);
});

export const BaseBrain = Model.define({
	name: 'Brain',
	Super: EventEmitter,
	data: Data.normalize,
	abstract: Definer.Abstract({}, { _external: null }),
	base: defineBase,
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
