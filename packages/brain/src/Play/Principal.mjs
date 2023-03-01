import { definePlay } from '@produck/duck-runner';
import * as Observation from './Observation/index.mjs';

export const play = definePlay(async function Principal({
	Kit, Bus, Environment, Brain, Options, Configuration,
}) {
	const PlayKit = Kit('Octopus::Play::Principal');

	async function observe() {
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
	}

	Brain.on('grant', observe);
	Environment.start();

	Bus.once('halt-request', () => {
		Brain.halt();
		Environment.stop();
		Brain.off('grant', observe);
	});

	await Brain.boot({
		id: Configuration.id,
		name: Options.name,
		version: Options.version,
	});
});
