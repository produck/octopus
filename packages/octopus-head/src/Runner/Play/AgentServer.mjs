import http from 'node:http';

import * as Quack from '@produck/quack';
import * as DuckLogQuack from '@produck/duck-log-quack';
import { definePlay } from '@produck/duck-runner';

export const play = definePlay(function AgentServer({
	Log, Web, Settings,
}) {
	Log('Agent');

	Log('AgentAccess', {
		Transcriber: DuckLogQuack.Transcribe({
			format: Quack.Format.Apache.Preset.CLF,
		}),
	});

	const app = Web.Application('Agent');
	const _app = Quack.Format.Apache.HttpAdapter(app, Log.AgentAccess);
	const { host, port } = Settings.agent.local;

	http.createServer(_app).listen(port, host);
	Log.Application(`Agent RJSP server is listening: host=${host} port=${port}.`);
});
