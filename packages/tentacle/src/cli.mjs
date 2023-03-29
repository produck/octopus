import * as fs from 'node:fs/promises';
import * as Duck from '@produck/duck';
import { defineFactory } from '@produck/duck-cli';
import * as readline from 'readline';

import * as Feature from './Feature/Broker/index.mjs';

const profile = [
	{ key: 'r', description: 'Run.' },
	{ key: 's', description: 'Abort.' },
	{ key: 'c', description: 'Exit.' },
	{ key: 'v', description: 'View status.' },
].map(item => `shift+${item.key} ${item.description}`).join(' / ');

const DevHandler = Duck.inject(({ Options }) => {
	let source = {};

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
			await broker.run(source);
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

	return async function develop(_source) {
		source = _source;
		readline.emitKeypressEvents(process.stdin, rl);

		if (process.stdin.isTTY) {
			process.stdin.setRawMode(true);
		}

		console.log(profile);

		process.stdin.on('keypress', listenKey);
	};
});

export const factory = defineFactory(({
	Kit, Workspace, Runner, Commander, setProgram, Id, Options, Environment,
}) => {
	const program = new Commander({ name: 'tentacle' });

	const start = new Commander({
		name: 'start', aliases: ['s'],
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
		}, ...Options.command.options.start],
		handler: async function start(_args, opts) {
			await Workspace.buildAll();

			if (opts.renew ||!await Id.has()) {
				await Id.write();
			} else {
				await Id.read();
			}

			Environment.id = Id.value;
			Environment.server.host = opts.host;
			Environment.server.port = Number(opts.port);

			await Options.command.start(
				opts, Environment,
				() => Runner.start(opts.mode),
			);
		},
	});

	const clean = new Commander({
		name: 'clean', aliases: ['c'],
		description: 'Cleaning local.',
		options: [{
			name: 'include-id', alias: 'i', required: false, value: null,
			description: 'If delete id when cleaning.',
		}, ...Options.command.options.clean],
		handler: async function clean(_args, opts) {
			if (opts.includeId) {
				await Id.clean();
			}

			await Options.command.clean(opts);
			await fs.rm(Workspace.getPath('temp'), { recursive: true });
			await fs.rm(Workspace.getPath('log'), { recursive: true });
		},
	});

	const dev = new Commander({
		name: 'develop', aliases: ['dev', 'd'],
		description: 'Just for dev no connecting.',
		handler: DevHandler(Kit),
	});

	program.appendChild(start, true);
	program.appendChild(clean);
	program.appendChild(dev);
	setProgram(program);
});
