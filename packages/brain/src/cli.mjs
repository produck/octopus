import { defineFactory } from '@produck/duck-cli';
import * as ConfigurationData from './Configuration.mjs';

export const factory = defineFactory(({
	Kit, Workspace, Runner, Commander, setProgram, Options, Configuration,
}) => {
	const program = new Commander({
		options: Options.cli.global,
	});

	const CustomKit = Kit('Custom::CLI::Installer');

	const start = new Commander({
		name: 'start',
		options: Options.cli.start,
		handler: async function start(_args, opts) {
			await Options.cli.start(opts, CustomKit);
			ConfigurationData.normalize(Configuration);
			await Runner.start(Configuration.runtime.toLowerCase());
		},
	});

	const install = new Commander({
		name: 'install',
		handler: async function install(_args, opts) {
			CustomKit.setProgram = null;
			CustomKit.Commander = null;
			await Options.cli.install(opts, CustomKit);
			await Workspace.buildAll();
		},
	});

	program.appendChild(start, true);
	program.appendChild(install);
	setProgram(program);

	const CLIExtenderKit = Kit('Custom::CLI::Extender');

	CLIExtenderKit.setProgram = null;
	Options.cli.extend(program, CLIExtenderKit);
});
