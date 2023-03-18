import { defineRouter } from '@produck/duck-web-koa-forker';

function toJobValueObject(job) {
	return {
		id: job.id,
		product: job.product,
		craft: job.craft,
		createdAt: job.createdAt,
		startedAt: job.startedAt,
		finishedAt: job.finishedAt,
		status: job.status,
		message: job.message,
	};
}

export const Router = defineRouter(function JobRouter(router, {
	Job,
}) {
	router
		.get(async function queryJobList(ctx) {
			const { product } = ctx.state;

			ctx.body = await Job.query({
				name: 'OfProduct',
				product: product.id,
			}).then(list => list.map(toJobValueObject));
		})
		.get('/{jobId}', async function getJobOfProduct(ctx) {
			const { product } = ctx.state;
			const { jobId } = ctx.params;

			const job = await Job.get(jobId);

			if (job === null || job.product !== product.id) {
				return ctx.throw(404);
			}

			ctx.body = toJobValueObject(job);
		});
});
