import { definePlay } from '@produck/duck-runner';
import { RJSP } from './Feature/index.mjs';

const sleep = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

export const play = definePlay(function Principal({
	Bus, Options, Environment, Broker, Client,
}) {
	Bus.on('halt', () => Environment.active = false);

	async function fulfill(request, role) {
		const { retry, interval } = Environment.config;
		let count = 0;

		return await (async function attempt() {
			count++;

			const result = await request();
			const { code } = result;

			if (RJSP.Code.isOK(code)) {
				return { ok: true, ret: result.body };
			}

			if (RJSP.Code.isRetrieable(code) && count <= retry) {
				await sleep(interval);

				return await attempt();
			}

			Bus.emit(`${role}-fail`);

			return { ok: false };
		})();
	}

	async function handleJob(newJob) {
		const { job: oldJob } = Environment;

		Environment.job = newJob;

		if (oldJob === newJob) {
			return;
		}

		if (oldJob !== null) {
			Bus.emit('free', newJob);

			if (Broker.busy) {
				await Broker.abort();
			}
		}

		if (newJob !== null) {
			Bus.emit('pick', newJob);

			const replay = await fulfill(() => Client.getSource(), 'source');

			if (replay.ok) {
				const result = await Broker.run(replay.source);

				if (result.ok === true) {
					await fulfill(() => Client.setTarget(result.target), 'target');
				} else {
					await fulfill(() => Client.setError(result.message), 'error');
				}
			}
		}
	}

	function updateConfig(_config) {
		if (_config.at > Environment.config.at) {
			Object.assign(Environment.config, _config);
			Bus.emit('config', { ..._config });
		}

		if (Environment.config.redirect) {
			Environment.server.host = Environment.config.host;
			Environment.server.port = Environment.config.port;
			Environment.config.at = 0;
			Environment.config.redirect = false;

			Bus.emit('redirect');
		}
	}

	async function ensureSync(data, done) {
		if (!Environment.active) {
			return;
		}

		const { code, body } = await Client.sync(data);

		if (RJSP.Code.isOK(code)) {
			Bus.emit('sync');
			updateConfig(body.config);
			handleJob(body.job);
			done();
		} else {
			Bus.emit('sync-fail');

			if (RJSP.Code.isRetrieable(code)) {
				setTimeout(() => ensureSync(data, done), Environment.config.interval);
			}

			if (RJSP.Code.isCritical(code)) {
				Bus.emit('halt');
			}
		}
	}

	async function observe() {
		if (!Environment.active) {
			return;
		}

		await new Promise(resolve => ensureSync({
			id: Environment.id,
			craft: Options.craft,
			version: Options.version,
			ready: Environment.ready && Broker.ready,
			job: Environment.job,
			config: { ...Environment.config },
		}, resolve));

		setTimeout(() => observe(), Environment.config.interval);
	}

	return function start() {
		Environment.active = true;
		observe();
		Bus.emit('boot');
	};
});
