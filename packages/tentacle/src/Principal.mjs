import { definePlay } from '@produck/duck-runner';
import { RJSP } from './Feature/index.mjs';

export const play = definePlay(function Principal({
	Bus, Options, Environment, Broker, Client,
}) {
	Bus.on('halt', () => Environment.active = false);

	function setServer() {
		Environment.server.host = Environment.config.host;
		Environment.server.port = Environment.config.port;
	}

	async function fulfill(request, role, id) {
		const { retry, interval } = Environment.config;
		let count = 0;

		return await (async function attempt() {
			count++;

			const result = await request();
			const { code } = result;

			if (RJSP.Code.isOK(code)) {
				return { ok: true, ret: result.body };
			}

			const retrieable = RJSP.Code.isRetrieable(code) && count <= retry;
			const premise = Environment.active && Environment.job === id;

			if (retrieable && premise) {
				Bus.emit('request-retry', role, code);
				await new Promise(resolve => setTimeout(resolve, interval));

				return await attempt();
			}

			Bus.emit('request-fail', role, code);

			return { ok: false };
		})();
	}

	async function handleJob(id) {
		console.log(id);
		if (!Broker.ready) {
			console.log('not ready');
			return;
		}

		const { job: oldJob } = Environment;

		if (oldJob === id) {
			return;
		}

		if (oldJob !== null) {
			Bus.emit('free', oldJob);

			if (Broker.busy) {
				await Broker.abort();
			}
		}

		if (id !== null) {
			Environment.job = id;
			Bus.emit('pick', id);

			const replay = await fulfill(() => Client.getSource(), 'source', id);

			if (replay.ok) {
				const result = await Broker.run(replay.ret);

				if (result.ok === true) {
					await fulfill(() => Client.setTarget(result.target), 'target', id);
				} else {
					await fulfill(() => Client.setError(result.message), 'error', id);
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
			setServer();
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
		setServer();
		observe();
		Bus.emit('boot');
	};
});
