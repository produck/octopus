import { definePlay } from '@produck/duck-runner';
import * as Observation from './Observation/index.mjs';

export const play = definePlay(function Principal({
	Kit, Log, Bus, Environment, Brain, Options, Configuration,
}) {
	const PlayKit = Kit('Octopus::Play::Principal');

	Log('principal');

	Brain.on('grant', async function observe() {
		try {
			if (!await Options.observer.lock(Brain.current.id)) {
				return;
			}

			Bus.emit('lock-ok');
		} catch {
			Bus.emit('lock-error');
		}

		const ObserverKit = PlayKit('Octopus::Play::Principal::Observer');

		try {
			await Observation.Tentacle.free(ObserverKit);
			await Observation.Product.clear(ObserverKit);
			await Observation.Product.evaluate(ObserverKit);
			await Observation.Job.assign(ObserverKit);
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
