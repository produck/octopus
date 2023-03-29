import { defineFactory } from '@produck/duck-cli';
import * as ConfigurationData from './Configuration.mjs';

export const factory = defineFactory(({
	Kit, Workspace, Runner, Commander, setProgram, Options, Configuration,
}) => {
	const program = new Commander({
		name: 'root',
		options: Options.cli.options.global,
	});

	const CustomKit = Kit('Custom::CLI::Installer');

	CustomKit.setProgram = null;
	CustomKit.Commander = null;

	const start = new Commander({
		name: 'start',
		description: 'Start server.',
		options: Options.cli.options.start,
		handler: async function start(_args, opts) {
			await Options.cli.start(opts, CustomKit, async () => {
				ConfigurationData.normalize(Configuration);
				await Runner.start(Configuration.runtime.toLowerCase());
			});
		},
	});

	const install = new Commander({
		name: 'install',
		description: 'Prepare file system and other components.',
		options: Options.cli.options.install,
		handler: async function install(_args, opts) {
			await Options.cli.install(opts, CustomKit, async () => {
				await Workspace.buildAll();
			});
		},
	});

	program.appendChild(start, true);
	program.appendChild(install);
	setProgram(program);

	const CLIExtenderKit = Kit('Custom::CLI::Extender');

	CLIExtenderKit.setProgram = null;
	Options.cli.extend(program, CLIExtenderKit);
});
