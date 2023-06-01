import cluster from 'node:cluster';

import * as Duck from '@produck/duck';
import * as DuckWorkspace from '@produck/duck-workspace';
import * as DuckWeb from '@produck/duck-web';
import * as DuckRunner from '@produck/duck-runner';
import * as DuckCLI from '@produck/duck-cli';
import * as DuckCLICommander from '@produck/duck-cli-commander';
import * as DuckLog from '@produck/duck-log';

import * as meta from './meta.gen.mjs';
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
			root: '.data',
			log: 'log', temp: 'tmp', tls: 'tls',
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
		DuckLog.Component({
			Agent: {},
			Application: {},
			System: {},
		}),
	],
}, function Brain({
	Kit, CLI, Bus, Runner,
}, ...args) {
	const options = Options.normalize(...args.slice(0, 1));
	const configuration = Configuration.normalize();

	Kit.Options = options;
	Kit.Configuration = configuration;

	const Craft = Feature.Craft.define({ ...options.Craft });
	const Procedure = Feature.Procedure.define({ ...options.Procedure });

	const CustomEnvironment = Feature.Environment.define({ ...options.Environment });
	const environment = new CustomEnvironment();

	Kit.Environment = environment;

	Kit.Craft = Craft;
	Kit.Procedure =  Procedure;

	Kit.Job = Feature.Job.define({ ...options.Job, Craft });
	Kit.Product = Feature.Product.define({ ...options.Product, Procedure });

	Kit.Application = Feature.Application.define({ ...options.Application });
	Kit.PublikKey = Feature.PublicKey.define({ ...options.PublicKey });
	Kit.Tentacle = Feature.Tentacle.define({ ...options.Tentacle });

	const BrainExternalAccessor = {
		MAX_ALIVE_GAP: () => environment.get('BRAIN.ALIVE.TIMEOUT'),
		WATCHING_INTERVAL: () => environment.get('BRAIN.WATCH.INTERVAL'),
	};

	Kit.Brain = Feature.Brain.define({
		...options.Brain,
		external: key => BrainExternalAccessor[key](),
	});

	Runner.ready();

	if (cluster.isPrimary) {
		Bus.on('crash', () => process.exit(1));
	}

	const brain = Object.freeze({
		configuration,
		halt() {
			Bus.emit('halt-request');
		},
		async boot(...args) {
			await CLI.parse(...args);
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

export { Environment } from './Feature/index.mjs';
