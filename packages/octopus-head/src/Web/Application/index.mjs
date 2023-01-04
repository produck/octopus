import { defineKoaApp } from '@produck/duck-web-koa';

import * as Router from './Router/index.mjs';

export const Provider = defineKoaApp(function Application(app, {
	Forker,
}) {
	app.use(Forker());
}, [
	Router.plugin,
]);
