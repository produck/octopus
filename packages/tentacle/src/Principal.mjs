import { Normalizer, S } from '@produck/mold';
import { definePlay } from '@produck/duck-runner';
import { RJSP, Broker, Tentacle } from './Feature/index.mjs';

export const ServerSchema = S.Object({
	host: RJSP.Data.HostSchema,
	port: RJSP.Data.PortSchema,
});

const normalizeServer = Normalizer(ServerSchema);

export const play = definePlay(function Principal({
	Kit, Bus, Options, Configuration,
}) {
	const config = RJSP.Data.normalizeConfig();

	const meta = {
		id: Configuration.id,
		craft: Options.craft,
		version: Options.version,
	};

	const server = normalizeServer();

	const client = new RJSP.Client({
		host: () => server.host,
		port: () => server.port,
		job: () => tentacle.job,
		timeout: () => config.timeout,
	});

	const broker = new Broker({
		shared: Options.shared,
		run: Options.run,
		abort: Options.abort,
	});

	const tentacle = new Tentacle({
		interval: () => config.interval,
		pick: async (job) => {
			const { code, body } = await client.getSource();
			const result = await broker.run(body);

			if (result.ok) {
				const { code } = await client.setTarget(result.target);
			} else {
				const { code } = await client.setError(result.message);
			}
		},
		free: async (job) => {

		},
		update: async () => {
			const { ready, job } = tentacle;
			const data = { ...meta, ready, job, config };

			return await new Promise(resolve => {
				(async function retry() {
					const { code, body } = await client.sync(data);

					if (RJSP.Code.isOK(code)) {
						Bus.emit('sync-ok');
						updateConfig(body.config);
						tentacle.setJob(body.job);
						return resolve();
					}

					Bus.emit('sync-errot', code);

					if (RJSP.Code.isRetrieable(code)) {
						setTimeout(() => retry(), config.interval);
					}

					if (RJSP.Code.isCritical(code)) {
						tentacle.stop();
						Bus.emit('request-halt');
					}
				})();
			});
		},
	});

	function updateConfig(_config) {
		if (_config.at > config.at) {
			Bus.emit('config', { ...Object.assign(config, _config) });
		}

		if (config.redirect) {
			server.host = config.host;
			server.port = config.port;
			config.at = 0;
			config.redirect = false;

			Bus.emit('redirect');
		}
	}

	Bus.on('request-halt', tentacle.stop());

	return async function start() {
		tentacle.start();
	};
});
