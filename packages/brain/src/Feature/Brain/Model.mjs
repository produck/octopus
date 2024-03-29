import { EventEmitter } from 'node:events';
import { Normalizer, P } from '@produck/mold';
import { Definer, Model, _ } from '@produck/shop';

import * as Data from './Data.mjs';
import * as Private from './private.mjs';

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
		Private._(this).emitter[key](...args);

		return this;
	}];

	for (const key of EMITTER_PROXY_KEYS) {
		Declare.Constructor.Method(...EmitterMethodProxy(key));
	}

	for (const key of EXTERNAL_KEYS) {
		Declare.Constructor.Accessor(...ExternalAccessor(key));
	}

	async function boot (_selfData) {
		const _class = Private._(this);

		if (_class.active) {
			throw new Error('A brain is alive currently.');
		}

		_class.active = true;

		const data = Data.normalize(_selfData);

		const self = await this.has(data.id)
			? await this.get(data.id)
			: await this.create(data);

		_class.current = self;

		(async function watch(Brain) {
			if (_class.current !== self) {
				return;
			}

			try {
				await self.load();

				if (self.isDestroyed) {
					Throw.ImplementError('The brain should NOT destroyed.');
				}

				const list = await Brain.query({ name: 'All' });

				if (list.length < 1) {
					Throw.ImplementError('There SHOULD be 1 brain at least.');
				}

				const aliveList = list
					.filter(brain => self.visitedAt - brain.visitedAt < Brain.MAX_ALIVE_GAP)
					.sort(byIdInASC);

				if (aliveList.length > 0 && aliveList[0].id === self.id) {
					_class.emitter.emit('grant');
				}
			} catch (error) {
				_class.emitter.emit('watch-error', error);
			}

			setTimeout(() => watch(Brain), Brain.WATCHING_INTERVAL);
		})(this);

		return this;
	}

	function halt() {
		const context = Private._(this);

		context.active = false;
		context.current = null;

		return this;
	}

	Declare.Constructor
		.Accessor('isActive', function () {
			return Private._(this).active;
		})
		.Accessor('current', function () {
			return Private._(this).current;
		})
		.Method('boot', boot)
		.Method('halt', halt);
});

export const BaseBrain = Model.define({
	name: 'Brain',
	Super: EventEmitter,
	creatable: true,
	data: Data.normalize,
	abstract: Definer.Abstract({}, { _external: null }),
	base: defineBase,
});
