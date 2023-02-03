import { EventEmitter } from 'events';
import { Definer, Model, _ } from '@produck/shop';

import * as Data from './Data.mjs';

const Plain = key => [key, function () {
	return _(this)[key];
}];

const At = key => [key, function atGetter() {
	return new Date(_(this)[key]);
}];

const AT_KEYS = ['createdAt', 'visitedAt'];
const PLAIN_KEYS = ['id', 'name', 'version'];
const byIdInDES = (brainA, brainB) => brainA.visitedAt - brainB.visitedAt;

export const BaseBrain = Model.define({
	name: 'Brain',
	Super: EventEmitter,
	data: Data.normalize,
	base: Definer.Base(({ Declare, Throw }) => {
		for (const key of PLAIN_KEYS) {
			Declare.Prototype.Accessor(...Plain(key));
		}

		for (const atKey of AT_KEYS) {
			Declare.Prototype.Accessor(...At(atKey));
		}

		let current = null;
		const isActive = () => current !== null;

		Declare.Constructor
			.Accessor('isActive', isActive)
			.Method('boot', async function (_data, env) {
				if (isActive()) {
					throw new Error('A brain is alive currently.');
				}

				const isAlive = brain => env.NOW - brain.visitedAt < env.MAX_ALIVE_GAP;
				const self = await this.get(Data.normalize(_data));

				current = self;

				(async function observe(Brain) {
					if (current !== self) {
						return;
					}

					try {
						await self.load();

						const list = await Brain.query();

						if (list.length < 1) {
							Throw.ImplementError('There SHOULD be 1 brain at least.');
						}

						const top = list.filter(isAlive).sort(byIdInDES)[0];

						if (top.id === self.id) {
							self.emit('grant');
						}
					} catch (error) {
						self.emit('watch-error', error);
					}

					setTimeout(() => observe(), env.INTERVAL);
				})(this);

				return self;
			})
			.Method('stop', () => current = null);
	}),
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
