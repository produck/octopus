import * as http from 'node:http';

import * as Quack from '@produck/quack';
import { definePlay } from '@produck/duck-runner';

export const play = definePlay(function AgentServer({
	Log, Bus, Web, Configuration,
}) {
	const app = Web.Application('Agent');
	const _app = Quack.Format.Apache.HttpAdapter(app, Log.AgentAccess);
	const { host, port } = Configuration.agent;
	const server = http.createServer(_app);

	Log.Agent(`Agent RJSP server is listening: host=${host} port=${port}.`);
	Bus.once('halt-request', () => server.close());

	return function () {
		server.listen(port, host);
	};
});
