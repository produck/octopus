import { defineFactory } from '@produck/duck-cli';

export const factory = defineFactory(({
	Kit, Workspace, Runner, Commander, setProgram,
}) => {
	const program = new Commander();

	const start = new Commander({
		handler: async function start() {
			await Runner.start();
		},
	});

	const install = new Commander({
		handler: async function install() {
			const OmenInstallerKit = Kit('Omen::Installer');

			await Workspace.buildAll();
		},
	});

	program.appendChild(start, true);
	program.appendChild(install);
	setProgram(program);
});
