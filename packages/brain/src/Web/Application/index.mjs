import { defineKoaApp } from '@produck/duck-web-koa';

import * as Router from './Router/index.mjs';

export const Provider = defineKoaApp(function Application(app, {
	Forker, Options,
}) {
	app
		.use(Forker())
		.use(Options.web.external);
}, [
	Router.plugin,
]);
