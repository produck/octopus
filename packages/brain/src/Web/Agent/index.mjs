import { koaBody } from 'koa-body';
import { defineKoaApp } from '@produck/duck-web-koa';

import * as Router from './Router/index.mjs';

export const Provider = defineKoaApp(function RJSPServer(app, {
	Forker,
}) {
	app
		.use(koaBody())
		.use(Forker());
}, [
	Router.plugin,
]);
