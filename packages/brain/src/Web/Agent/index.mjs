import KoaBody from 'koa-body';
import { defineKoaApp } from '@produck/duck-web-koa';
import * as DuckWebKoaForker from '@produck/duck-web-koa-forker';

import * as RJSP from './RJSP.mjs';

const RJSPRouter = DuckWebKoaForker.defineRouter(function RJSPRouter(router, {
	Environment, Tentacle, Craft, Job,
}) {
	function Configuration() {
		return {
			age: Environment.get('ENVIRONMENT.AGE'),
			syncInterval: Environment.get('AGENT.SYNC.INTERVAL'),
			syncTimeout: Environment.get('AGENT.SYNC.TIMEOUT'),
			syncRetryInterval: Environment.get('AGENT.SYNC.RETRY.INTERVAL'),
			host: Environment.get('RJSP.SERVER.HOST'),
			port: Environment.get('RJSP.SERVER.PORT'),
		};
	}

	router
		.put('/sync', KoaBody.default(), async function handleData(ctx) {
			const data = RJSP.normalize(ctx.request.body);

			if (!Craft.isValid(data.meta.craft)) {
				return ctx.throw(403, 'Unavailable craft.');
			}

			const tentacle = await Tentacle.fetch();

			ctx.body = await tentacle.visit().save();
		})
		.get('/job/request', async function getCurrentJob() {

		})
		.post('/job/response', async function finishJob() {

		})
		.post('/job/error', async function catchJob() {

		});
});

export const Provider = defineKoaApp(function Agent(app, {
	Forker,
}) {
	app.use(Forker());
}, [
	DuckWebKoaForker.Plugin({
		name: 'RJSP',
		path: '/',
		provider: RJSPRouter,
	}),
]);
