import { definePlay } from '@produck/duck-runner';
import { RJSP, Broker, Tentacle } from './Feature/index.mjs';

export const play = definePlay(function Principal({
	Bus, Options, Environment,
}) {
	const client = new RJSP.Client({
		host: () => Environment.server.host,
		port: () => Environment.server.port,
		job: () => tentacle.job,
		timeout: () => Environment.config.timeout,
	});

	const broker = new Broker({
		shared: Options.shared,
		run: Options.run,
		abort: Options.abort,
	});

	const tentacle = new Tentacle({
		interval: () => Environment.config.interval,
		pick: async (job) => {
			Bus.emit('pick', job);

			const { code, body } = await client.getSource();
			const result = await broker.run(body);

			if (result.ok) {
				const { code } = await client.setTarget(result.target);
			} else {
				const { code } = await client.setError(result.message);
			}
		},
		free: async (job) => {
			Bus.emit('free', job);

			if (broker.busy) {
				await broker.abort();
			}
		},
		update: async () => {
			const data = {
				id: Environment.id,
				craft: Options.craft,
				version: Options.version,
				ready: Environment.ready && broker.ready,
				job: tentacle.job,
				config: { ...Environment.config },
			};

			let done;

			(async function retry() {
				const { code, body } = await client.sync(data);

				if (RJSP.Code.isOK(code)) {
					Bus.emit('sync');
					updateConfig(body.config);

					tentacle.setJob(body.job).catch(error => {
						Bus.emit('work-error', error.message);
						Bus.emit('request-halt');

						throw error;
					});

					done();
				} else {
					Bus.emit('sync-error', code);

					if (RJSP.Code.isRetrieable(code)) {
						setTimeout(() => retry(), Environment.config.interval);
					}

					if (RJSP.Code.isCritical(code)) {
						tentacle.stop();
						Bus.emit('request-halt');
					}
				}
			})();

			return await new Promise(resolve => done = resolve);
		},
	});

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

	Bus.on('request-halt', tentacle.stop());

	return async function start() {
		tentacle.start();
	};
});
