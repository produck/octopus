import fs from 'node:fs';
import * as http from 'node:http';
import * as https from 'node:https';

import * as Quack from '@produck/quack';
import { definePlay } from '@produck/duck-runner';
import * as DuckLogQuack from '@produck/duck-log-quack';

const Mode = {
	HTTP: function HttpOnly(app, { Log, Bus, Configuration }) {
		const { port, host } = Configuration.application.http;
		const server = http.createServer(app).listen(port, host);

		Log.Application(`Http server is listening: host=${host} port=${port}`);
		Bus.once('halt-request', () => server.close());
	},
	HTTPS: function HttpsOnly(app, { Log, Bus, Workspace, Configuration }) {
		const { host, port, key, cert } = Configuration.application.https;
		const keyPath = Workspace.resolve('tls', key);
		const certPath = Workspace.resolve('tls', cert);

		if (!fs.existsSync(keyPath)) {
			throw new Error(`Can NOT found "key.pem" in "${keyPath}".`);
		}

		if (!fs.existsSync(certPath)) {
			throw new Error(`Can NOT found "cert.pem" in "${certPath}".`);
		}

		const server = https.createServer({
			key: fs.readFileSync(keyPath),
			cert: fs.readFileSync(certPath),
		}, app).listen(port, host);

		Log.Application(`Https server is listening: host=${host} port=${port}`);
		Bus.once('halt-request', () => server.close());
	},
	REDIRECT: function Redirect(app, { Log, Bus, Web, Kit, Configuration }) {
		Mode.HTTPS(app, Kit);

		const { port, host } = Configuration.application.http;
		const rapp = Web.Application('Redirect');
		const _rapp = Quack.Format.Apache.HttpAdapter(rapp, Log.ApplicationAccess);

		const server = http
			.createServer(_rapp)
			.listen(port, host);

		Log.Application(`Redirect server is listening: host=${host} port=${port}`);
		Bus.once('halt-request', () => server.close());
	},
	BOTH: function Both(app, Kit) {
		Mode.HTTP(app, Kit);
		Mode.HTTPS(app, Kit);
	},
};

export const play = definePlay(function ApplicationServer({
	Kit, Log, Web, Configuration,
}) {
	Log('ApplicationAccess', {
		label: 'application',
		Transcriber: DuckLogQuack.Transcriber({
			format: Quack.Format.Apache.Preset.CLF,
			assert: () => true,
		}),
	});

	const app = Web.Application('Application');

	return function () {
		const mode = Configuration.application.mode;

		Log.Application(`Running in "${mode}" mode.`);
		Mode[mode](Quack.Format.Apache.HttpAdapter(app, Log.ApplicationAccess), Kit);
	};
});
