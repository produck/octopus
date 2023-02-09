import { T, U } from '@produck/mold';
import { EventEmitter } from 'node:events';
import { Definer, Model, _ } from '@produck/shop';

import * as Data from './Data.mjs';
import { Evaluator } from './Evaluator.mjs';

const EMITTER_PROXY_KEYS = ['on', 'off', 'once'];
const PLAIN_KEYS = ['name'];

const Plain = key => [key, function () {
	return _(this)[key];
}];

const defineBase = Definer.Base(({ Declare }) => {
	const emitter = new EventEmitter();

	const EmitterMethodProxy = key => [key, function proxy(...args) {
		emitter[key](...args);

		return this;
	}];

	for (const key of EMITTER_PROXY_KEYS) {
		Declare.Constructor.Method(...EmitterMethodProxy(key));
	}

	for (const key of PLAIN_KEYS) {
		Declare.Prototype.Accessor(...Plain(key));
	}

	function evaluate(jobList, tentacleList) {
		const matched = {};
		const evaluator = new Evaluator(jobList, tentacleList, matched);

		try {
			_(this).policy(evaluator);
		} catch (cause) {
			emitter.emit('policy-error', cause);

			throw new Error('Bad craft policy.', { cause });
		}

		Object.freeze(matched);
		emitter.emit('assign', matched);

		return matched;
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

	Declare.Prototype
		.Method('evaluate', evaluate)
		.Method('isSource', isSource)
		.Method('isTarget', isTarget);
});

export const BaseCraft = Model.define({
	name: 'Craft',
	creatable: true,
	data: Data.normalize,
	base: defineBase,
});
