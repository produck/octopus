import * as fs from 'node:fs/promises';
import { defineFactory } from '@produck/duck-cli';

import * as Develop from './develop.mjs';

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
		handler: async () => Develop.DevHandler(Kit).start(),
	});

	program.appendChild(start, true);
	program.appendChild(clean);
	program.appendChild(dev);
	setProgram(program);
});
