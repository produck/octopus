import KoaBody from 'koa-body';
import { defineKoaApp } from '@produck/duck-web-koa';
import * as DuckWebKoaForker from '@produck/duck-web-koa-forker';

import * as RJSP from './RJSP.mjs';

const RJSPRouter = DuckWebKoaForker.defineRouter(function RJSPRouter(router, {
	Environment, Workshop, Agent,
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
		.put('/sync', KoaBody(), async function handleData(ctx) {
			const data = RJSP.normalize(ctx.request.body);

			if (!Workshop.Job.Craft.has(data.meta.craft)) {
				return ctx.throw(403, 'Unavailable craft.');
			}

			const agent = await Agent.fetch(data.id, data.meta);

			agent.activate();
			agent.setJob(data.job);

			if (data.rpc.length > 0) {
				agent.receive(data.rpc);
			}

			ctx.body = {
				...data,
				config: Configuration(),
				rpc: agent.consume(),
			};

			await agent.commit();
		})
		.get('/job/content', async function getCurrentJob() {

		})
		.post('/job/result', async function finishJob() {

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
