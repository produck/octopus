import { T, U } from '@produck/mold';
import { Definer, Model, _ } from '@produck/shop';

import * as Data from './Data.mjs';
import { Evaluator } from './Evaluator.mjs';
import * as Private from './private.mjs';

const EMITTER_PROXY_KEYS = ['on', 'off', 'once'];
const PLAIN_KEYS = ['name'];

const Plain = key => [key, function () {
	return _(this)[key];
}];

export function assertCraftName(any) {
	if (!T.Native.String(any)) {
		U.throwError('name', 'string');
	}
}

function isSource(any) {
	const _flag = _(this).source(any);

	if (!T.Native.Boolean(_flag)) {
		U.throwError('flag <= data.source()', 'boolean');
	}

	return _flag;
}

function isTarget(any) {
	const _flag = _(this).target(any);

	if (!T.Native.Boolean(_flag)) {
		U.throwError('flag <= data.target()', 'boolean');
	}

	return _flag;
}

const defineBase = Definer.Base(({ Declare }) => {
	const EmitterMethodProxy = key => [key, function proxy(...args) {
		Private._(this).emitter[key](...args);

		return this;
	}];

	for (const key of EMITTER_PROXY_KEYS) {
		Declare.Constructor.Method(...EmitterMethodProxy(key));
	}

	for (const key of PLAIN_KEYS) {
		Declare.Prototype.Accessor(...Plain(key));
	}

	function evaluate(jobList, tentacleList) {
		const _class = Private._(this.constructor);
		const matched = {};
		const evaluator = new Evaluator(jobList, tentacleList, matched);

		try {
			_(this).policy(evaluator);
		} catch (cause) {
			_class.emitter.emit('policy-error', cause);

			throw new Error('Bad craft policy.', { cause });
		}

		Object.freeze(matched);
		_class.emitter.emit('assign', matched);

		return matched;
	}

	Declare.Prototype
		.Method('evaluate', evaluate)
		.Method('isSource', isSource)
		.Method('isTarget', isTarget);

	Declare.Constructor
		.Accessor('names', function () {
			return Object.keys(Private._(this).registry);
		})
		.Method('register', async function (...args) {
			const craft = await this.create(...args);

			Private._(this).registry[craft.name] = craft;

			return craft;
		})
		.Method('isValid', function (name) {
			assertCraftName(name);

			return Object.hasOwn(Private._(this).registry, name);
		})
		.Method('use', function (name) {
			if (!this.isValid(name)) {
				throw new Error(`There is no craft(${name}).`);
			}

			return Private._(this).registry[name];
		});
});

export const BaseCraft = Model.define({
	name: 'Craft',
	creatable: true,
	data: Data.normalize,
	base: defineBase,
});
