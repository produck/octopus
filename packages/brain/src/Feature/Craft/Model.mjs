import { EventEmitter } from 'node:events';
import { Definer, Model, _ } from '@produck/shop';

import * as Data from './Data.mjs';
import { Evaluator } from './Evaluator.mjs';

const EMITTER_PROXY_KEYS = ['on', 'off', 'once'];
const PLAIN_KEYS = ['id', 'owner', 'model', 'status', 'message'];

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

			return matched;
		} catch (cause) {
			emitter.emit('policy-error', cause);

			throw new Error('Craft policy error.', { cause });
		}
	}

	Declare.Prototype
		.Method('evaluate', evaluate);
});

export const BaseCraft = Model.define({
	name: 'Craft',
	creatable: true,
	data: Data.normalize,
	base: defineBase,
});
