import * as http from 'node:http';

import * as Quack from '@produck/quack';
import { definePlay } from '@produck/duck-runner';
import * as DuckLogQuack from '@produck/duck-log-quack';

export const play = definePlay(function AgentServer({
	Log, Environment, Bus, Web, Configuration,
}) {
	Log('AgentAccess', {
		label: 'agent',
		Transcriber: DuckLogQuack.Transcriber({
			format: Quack.Format.Apache.Preset.CLF,
			assert: () => true,
		}),
	});

	const app = Web.Application('Agent');
	const _app = Quack.Format.Apache.HttpAdapter(app, Log.AgentAccess);
	const server = http.createServer(_app);

	Bus
		.on('environment-updated', () => Environment.fetch())
		.on('halt-request', () => server.close());

	return function startAgentServer() {
		const { host, port } = Configuration.agent;

		server.listen(port, host);
		Log.Agent(`Agent RJSP server is listening: host=${host} port=${port}.`);
	};
});
