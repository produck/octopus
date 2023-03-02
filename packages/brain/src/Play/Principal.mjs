import { definePlay } from '@produck/duck-runner';
import * as Observation from './Observation/index.mjs';

export const play = definePlay(function Principal({
	Kit, Log, Bus, Environment, Brain, Options, Configuration,
}) {
	const PlayKit = Kit('Octopus::Play::Principal');

	Log('principal');

	Brain.on('grant', async function observe() {
		try {
			if (!await Options.observer.lock()) {
				return;
			}

			Bus.emit('lock-ok');
		} catch {
			Bus.emit('lock-error');
		}

		try {
			await Observation.Tentacle.free(PlayKit);
			await Observation.Product.evaluate(PlayKit);
			await Observation.Job.assign(PlayKit);
			Bus.emit('observe-ok');
		} catch (error) {
			Bus.emit('observe-error');
		}

		try {
			await Options.observer.unlock();
			Bus.emit('unlock-ok');
		} catch {
			Bus.emit('unlock-error');
		}
	});

	let running = false;

	Bus.once('halt-request', () => {
		if (!running) {
			return;
		}

		Brain.halt();
		Environment.stop();
		running = false;
	});

	Environment.on('update', () => Bus.emit('environment-updated'));

	return async function start() {
		running = true;

		Environment.start();

		await Brain.boot({
			id: Configuration.id,
			name: Options.name,
			version: Options.version,
		});
	};
});
