import { T, U } from '@produck/mold';
import { defineKoaApp } from '@produck/duck-web-koa';

import * as Router from './Router/index.mjs';

export const Provider = defineKoaApp(function Application(app, {
	Kit, Forker, Options,
}) {
	const ExternalWebKit = Kit('ExternalWeb');
	const externalMiddleware = Options.web.external(ExternalWebKit);

	if (!T.Native.Function(externalMiddleware)) {
		U.throwError('middleware <= Options.web.external()', 'function');
	}

	app
		.use(Forker())
		.use(externalMiddleware);
}, [
	Router.plugin,
]);
