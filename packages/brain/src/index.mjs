import * as Duck from '@produck/duck';
import * as DuckWorkspace from '@produck/duck-workspace';
import * as DuckWeb from '@produck/duck-web';
import * as DuckRunner from '@produck/duck-runner';
import * as DuckCLI from '@produck/duck-cli';
import * as DuckLog from '@produck/duck-log';

import * as DuckCLICommander from '@produck/duck-cli-commander';

import * as meta from './version.mjs';
import * as CLI from './cli.mjs';
import * as Feature from './Feature/index.mjs';
import * as WebApp from './Web/index.mjs';
import * as Play from './Play/index.mjs';
import * as Options from './Options.mjs';
import * as Configuration from './Configuration.mjs';

export const Brain = Duck.define({
	id: 'org.produck.octopus.brain',
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
			modes: {
				solo: DuckRunner.Template.Solo(),
				processes: DuckRunner.Template.Processes(),
			},
			roles: {
				AgentServer: Play.AgentServer,
				ApplicationServer: Play.ApplicationServer,
				Principal: Play.Principal,
				System: Play.System,
			},
		}),
		DuckCLI.Component(CLI.factory, DuckCLICommander.Provider),
		DuckLog.Component(),
	],
}, function OctopusHead({
	CLI, Kit, Bus,
}, ...args) {
	const options = Kit.Options = Options.normalize(...args);
	const Craft = Kit.Craft = Feature.Craft.define(options.Craft);
	const Procedure = Kit.Procedure = Feature.Procedure.define(options.Procedure);

	Kit.Application = Feature.Application.define(options.Application);
	Kit.Brain = Feature.Brain.define(options.Brain);
	Kit.Environment = Feature.Environment.define(options.Environment);
	Kit.Job = Feature.Job.define(options.Job);
	Kit.Product = Feature.Product.define(options.Product);
	Kit.PublikKey = Feature.PublicKey.define(options.PublicKey);
	Kit.Tentacle = Feature.Tentacle.define(options.Tentacle);
	Kit.Configuration = Configuration.normalize();

	async function halt() {
		Bus.emit('halt-request');
	}

	const brain = Object.freeze({
		halt,
		async boot(...args) {
			await CLI.parser(...args);

		},
		Model(...args) {
			Procedure.register(...args);

			return brain;
		},
		Craft(...args) {
			Craft.register(...args);

			return brain;
		},
	});

	return brain;
});
