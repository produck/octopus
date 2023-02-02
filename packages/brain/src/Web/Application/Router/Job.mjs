import { defineRouter } from '@produck/duck-web-koa-forker';

export const Router = defineRouter(function JobRouter(router) {
	router
		.get(async function queryJobList(ctx) {
			ctx.body = await ctx.state.product.Job.all();
		})
		.get('/{jobId}', async function () {

		});
});
