import { definePlay } from '@produck/duck-runner';
import * as Observation from './Observation/index.mjs';

export const play = definePlay(function Principal({
	Kit, Log, Bus, Environment, Brain, Options, Configuration,
}) {
	const PlayKit = Kit('Octopus::Play::Principal');

	Log('principal');

	async function lock() {
		try {
			if (!await Options.observer.lock(Brain.current.id)) {
				return false;
			}

			Bus.emit('lock-ok');

			return true;
		} catch (error) {
			Bus.emit('lock-error', error.message);
			throw error;
		}
	}

	async function batch() {
		const ObserverKit = PlayKit('Octopus::Play::Principal::Observer');

		try {
			await Observation.Tentacle.free(ObserverKit);
			await Observation.Product.clear(ObserverKit);
			await Observation.Product.evaluate(ObserverKit);
			await Observation.Job.assign(ObserverKit);
			Bus.emit('observe-ok');

			return true;
		} catch (error) {
			Bus.emit('observe-error', error.message);
			throw error;
		}
	}

	async function unlock() {
		try {
			await Options.observer.unlock(Brain.current.id);
			Bus.emit('unlock-ok');
		} catch (error) {
			Bus.emit('unlock-error', error.message);
			throw error;
		}
	}

	Brain.on('grant', async function observe() {
		try {
			await lock() && await batch() && await unlock();
		} catch (error) {
			Bus.emit('observe-error', error.message);
		}
	});

	let running = false;

	Bus.on('halt-request', () => {
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
