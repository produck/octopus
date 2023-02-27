import { defineRouter } from '@produck/duck-web-koa-forker';

export const Router = defineRouter(function JobRouter(router, {
	Job,
}) {
	router
		.get(async function queryJobList(ctx) {
			const { product } = ctx.state;

			ctx.body = await Job.query({
				name: 'OfProduct',
				product: product.id,
			});
		})
		.get('/{jobId}', async function getJobOfProduct(ctx) {
			const { product } = ctx.state;
			const { jobId } = ctx.params;

			const job = await Job.get(jobId);

			if (job === null || job.product !== product.id) {
				return ctx.throw(404);
			}

			ctx.body = job;
		});
});
