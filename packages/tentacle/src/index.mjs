import * as Duck from '@produck/duck';
import * as DuckWorkspace from '@produck/duck-workspace';
import * as DuckLog from '@produck/duck-log';
import * as DuckRunner from '@produck/duck-runner';
import * as DuckCLI from '@produck/duck-cli';
import * as DuckCLICommander from '@produck/duck-cli-commander';

import * as meta from './meta.gen.mjs';
import * as CLI from './cli.mjs';
import * as Options from './Options.mjs';
import * as Environment from './Environment.mjs';
import { play as PrincipalPlay } from './Principal.mjs';
import * as Feature from './Feature/index.mjs';
import * as Develop from './develop.mjs';

export const Tentacle = Duck.define({
	id: 'org.produck.octopus.tentacle',
	name: meta.name,
	version: meta.version,
	description: meta.description,
	components: [
		DuckWorkspace.Component({ root: '.data', log: 'log', temp: 'tmp' }),
		DuckLog.Component({}),
		DuckRunner.Component({
			modes: {
				solo: DuckRunner.Template.Solo(),
				processes: DuckRunner.Template.Processes(),
			},
			roles: { Principal: PrincipalPlay },
		}),
		DuckCLI.Component(CLI.factory, DuckCLICommander.Provider),
	],
}, function Tentacle({
	Kit, Workspace, Runner, Bus, CLI,
}, ...args) {
	const options =  Options.normalize(...args);
	const environment = Environment.normalize();

	const broker = new Feature.Broker({
		shared: options.shared,
		run: options.run,
		abort: options.abort,
	});

	const client = new Feature.RJSP.Client({
		host: () => environment.server.host,
		port: () => environment.server.port,
		job: () => environment.job,
		timeout: () => environment.config.timeout,
	});

	const identifier = new Feature.Identifier.Accessor(options.id, {
		get workspace() {
			return Workspace.root;
		},
		get temp() {
			return Workspace.getPath('temp');
		},
	});

	Object.assign(Kit, {
		Id: identifier,
		Options: options,
		Environment: environment,
		Broker: broker,
		Client: client,
	});

	Runner.ready();

	return Object.freeze({
		environment,
		boot: async(...args) => await CLI.parse(...args),
		halt: () => Bus.emit('halt'),
		test: (...args) => Develop.DevHandler(Kit).start(...args),
	});
});
