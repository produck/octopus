import { Normalizer, P, S } from '@produck/mold';
import * as Duck from '@produck/duck';
import * as readline from 'readline';

import * as Feature from './Feature/Broker/index.mjs';

const profile = [
	{ key: 'r', description: 'Run.' },
	{ key: 's', description: 'Abort.' },
	{ key: 'c', description: 'Exit.' },
	{ key: 'v', description: 'View status.' },
].map(item => `shift+${item.key} ${item.description}`).join(' / ');

const OptionsSchema = S.Object({
	fetch: P.Function(() => {}),
});

const normalizeOptions = Normalizer(OptionsSchema);

export const DevHandler = Duck.inject(({ Options }) => {
	const store = {
		fetch: async () => {},
	};

	const broker = new Feature.Broker({
		shared: Options.shared,
		run: Options.run,
		abort: Options.abort,
	});

	const rl = readline.createInterface({ input: process.stdin });

	const keyMap = {
		r: async () => {
			if (broker.busy) {
				return console.log('Running, Stop first(ctrl+s)!');
			}

			console.log('WORK BEGIN ==================>');
			await broker.run(await store.fetch());
		},
		s: async () => {
			if (!broker.busy) {
				return console.log('Idle, run first(ctrl+r)');
			}

			if (!broker.ready) {
				console.log('Work can NOT be aborted. Keeping running until the end.');

				return;
			}

			console.log('Aborting...');
			await broker.abort();
			console.log('WORK END ====================>');
		},
		c: () => {
			rl.close();
			process.stdin.off('keypress', listenKey);
			console.log('Force kill.');
			process.exit();
		},
		v: () => console.log({ busy: broker.busy, ready: broker.ready }),
	};

	const listenKey = (c, k) => {
		if (k.shift) {
			const fn = keyMap[k.name];

			if (!fn) {
				console.log('Undefined behavior.');
				console.log(profile);
			} else {
				keyMap[k.name]();
			}
		}
	};

	return {
		start(...args) {
			const options = normalizeOptions(...args);

			store.fetch = options.fetch;

			readline.emitKeypressEvents(process.stdin, rl);

			if (process.stdin.isTTY) {
				process.stdin.setRawMode(true);
			}

			console.log(profile);
			process.stdin.on('keypress', listenKey);
		},
	};
});
