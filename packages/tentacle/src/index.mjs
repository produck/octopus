import * as Duck from '@produck/duck';
import * as DuckWorkspace from '@produck/duck-workspace';
import * as DuckLog from '@produck/duck-log';
import * as DuckRunner from '@produck/duck-runner';
import * as DuckCLI from '@produck/duck-cli';
import * as DuckCLICommander from '@produck/duck-cli-commander';

import * as meta from './meta.gen.mjs';
import * as CLI from './cli.mjs';

export const Tentacle = Duck.define({
	id: 'org.produck.octopus.tentacle',
	name: meta.name,
	version: meta.version,
	description: meta.description,
	components: [
		DuckWorkspace.Component({
			root: '.data',
			id: 'id', log: 'log', temp: 'tmp',
		}),
		DuckLog.Component({

		}),
		DuckRunner.Component({
			modes: {
				solo: DuckRunner.Template.Solo(),
				processes: DuckRunner.Template.Processes(),
			},
		}),
		DuckCLI.Component(CLI.factory, DuckCLICommander.Provider),
	],
}, function Tentacle({
	Kit, Runner, CLI,
}) {

	Runner.ready();

	return Object.freeze({
		boot: async(...args) => await CLI.parse(...args),
	});
});
