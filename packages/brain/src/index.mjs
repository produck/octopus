import * as Duck from '@produck/duck';
import * as DuckWorkspace from '@produck/duck-workspace';
import * as DuckWeb from '@produck/duck-web';
import * as DuckRunner from '@produck/duck-runner';
import * as DuckCLI from '@produck/duck-cli';
import * as DuckLog from '@produck/duck-log';

import * as DuckCLICommander from '@produck/duck-cli-commander';

import * as meta from './version.mjs';
import * as CLI from './cli.mjs';
import * as WebApp from './Web/index.mjs';
import * as Runner from './Runner/index.mjs';

export const OctopusHead = Duck.define({
	id: 'org.produck.octopus.head',
	name: meta.name,
	version: meta.version,
	description: meta.description,
	components: [
		DuckWorkspace.Component({
			log: 'log',
			temp: 'tmp',
			tls: 'tls',
		}),
		DuckWeb.Component([
			{ id: 'Redirect', provider: DuckWeb.Preset.RedirectHttps },
			{ id: 'Application', provider: WebApp.Application },
			{ id: 'Agent', provider: WebApp.Agent },
		]),
		DuckRunner.Component({
			roles: {
				AgentServer: Runner.Play.AgentServer,
				ApplicationServer: Runner.Play.ApplicationServer,
				Scheduler: Runner.Play.Scheduler,
				System: Runner.Play.System,
			},
		}),
		DuckCLI.Component(CLI.factory, DuckCLICommander.Provider),
		DuckLog.Component(),
	],
}, function OctopusHead({
	CLI, Kit, Bus, Workshop, Environment,
}, options) {
	Kit.Options = options;

	return Object.freeze({
		boot: async () => await CLI.parser(),
		halt: async () => Bus.emit('halt-request'),
		Model: () => {},
		Craft: () => {},
	});
});
