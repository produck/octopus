import { definePlay } from '@produck/duck-runner';
import * as Observation from './Observation/index.mjs';

export const play = definePlay(function Principal({
	Kit, Bus, Environment, Brain, Options, Configuration,
}) {
	const PlayKit = Kit('Octopus::Play::Principal');

	Brain.on('grant', async function observe() {
		if (!await Options.isEvaluatable()) {
			return;
		}

		try {
			await Observation.Tentacle.free(PlayKit);
			await Observation.Product.evaluate(PlayKit);
			await Observation.Job.assign(PlayKit);
		} catch (error) {
			console.log(error);
		}
	});

	Bus.once('halt-request', () => {
		Brain.halt();
		Environment.stop();
	});

	return async function () {
		Environment.start();

		await Brain.boot({
			id: Configuration.id,
			name: Options.name,
			version: Options.version,
		});
	};
});
