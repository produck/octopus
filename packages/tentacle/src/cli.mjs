import * as Duck from '@produck/duck';
import { defineFactory } from '@produck/duck-cli';
import * as readline from 'readline';

import * as Feature from './Feature/Broker/index.mjs';

const profile = [
	{ key: 'r', description: 'Run.' },
	{ key: 's', description: 'Abort.' },
	{ key: 'c', description: 'Exit.' },
	{ key: 'q', description: 'Querying broker status.' },
].map(item => `ctrl+${item.k} ${item.description}`).join(' / ');

const DevHandler = Duck.inject(({ Options }) => {
	let source = {};

	const broker = new Feature.Broker({
		shared: Options.shared,
		run: Options.run,
		abort: Options.abort,
	});

	const keyMap = {
		r: async () => {
			if (broker.busy) {
				return console.log('Running, Stop first(ctrl+s)!');
			}

			console.log('Work begin ==================>');
			await broker.run(source);
		},
		s: async () => {
			if (!broker.busy) {
				return console.log('Idle, run first(ctrl+r)');
			}

			console.log('Aborting...');
			await broker.abort();
		},
		c: () => process.exit(),
	};

	return async function develop(_source) {
		source = _source;
		readline.emitKeypressEvents(process.stdin);
		process.stdin.setRawMode(true);
		console.log(profile);

		process.stdin.on('keypress', (c, k) => {
			if (k.ctrl) {
				const fn = keyMap[k.name];

				if (!fn) {
					console.log('Undefined behavior.');
					console.log(profile);
				}

				keyMap[k.name]();
			}
		});
	};
});

export const factory = defineFactory(({
	Kit, Runner, Commander, setProgram, Environment,
}) => {
	const program = new Commander({ name: 'tentacle' });

	const start = new Commander({
		name: 'start',
		description: 'Start and connect to server.',
		options: [{
			name: 'mode', alias: 'm', required: false,
			value: { name: 'mode', required: true, default: 'processes' },
			description: 'In which mode(case-insensitive)',
		}, {
			name: 'host', alias: 'h', required: false,
			value: { name: 'host', required: true, default: '127.0.0.1' },
			description: 'The server host.',
		}, {
			name: 'port', alias: 'p', required: false,
			value: { name: 'port', required: true, default: '9173' },
			description: 'The server port',
		}, {
			name: 'renew', alias: 'r', required: false, value: null,
			description: 'Force to create a new agent id or not',
		}],
		handler: async function install(_args, opts) {
			Environment.server.host = opts.host;
			Environment.server.port = Number(opts.port);
			Runner.start(opts.mode);
		},
	});

	const clean = new Commander({
		name: 'clean',
		description: 'Cleaning local ',
		options: [{
			name: 'include-id', alias: 'i', required: false, value: null,
			description: 'If delete id when cleaning.',
		}],
	});

	const dev = new Commander({
		name: 'dev',
		description: 'Just for dev no connecting.',
		handler: DevHandler(Kit),
	});

	program.appendChild(start, true);
	program.appendChild(clean);
	program.appendChild(dev);
	setProgram(program);
});
