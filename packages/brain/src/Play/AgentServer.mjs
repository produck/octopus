import http from 'node:http';

import * as Quack from '@produck/quack';
import * as DuckLogQuack from '@produck/duck-log-quack';
import { definePlay } from '@produck/duck-runner';

export const play = definePlay(function AgentServer({
	Log, Web, Configuration,
}) {
	Log('Agent');

	Log('AgentAccess', {
		label: 'agent',
		Transcriber: DuckLogQuack.Transcriber({
			format: Quack.Format.Apache.Preset.CLF,
		}),
	});

	const app = Web.Application('Agent');
	const _app = Quack.Format.Apache.HttpAdapter(app, Log.AgentAccess);
	const { host, port } = Configuration.agent;

	http.createServer(_app).listen(port, host);
	Log.main(`Agent RJSP server is listening: host=${host} port=${port}.`);
});
