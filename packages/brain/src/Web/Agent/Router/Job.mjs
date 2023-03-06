import { defineRouter } from '@produck/duck-web-koa-forker';

export const Router = defineRouter(function JobRouter(router, {
	Craft, Job,
}) {
	router
		.param('jobId', async (jobId, ctx, next) => {
			const job = await Job.get(jobId);

			if (job === null) {
				return ctx.throw(404);
			}

			ctx.state.job = job;

			return next();
		})
		.get('/{jobId}/source', async function getSource(ctx) {
			ctx.body = ctx.state.job.source;
		})
		.use(function ensureUnfinished(ctx, next) {
			if (ctx.state.job.finishedAt !== null) {
				return ctx.throw(423, 'Job has been finished.');
			}

			return next();
		})
		.post('/{jobId}/target', async function setTarget(ctx) {
			const { body: target } = ctx.request;
			const { job } = ctx.state;

			const craft = Craft.use(job.craft);

			if (!craft.isTarget(target)) {
				return ctx.throw(400, 'Bad target');
			}

			await job.complete(target).save();

			ctx.body = job.target;
		})
		.post('/{jobId}/error', async function setError(ctx) {
			const { body: error } = ctx.request;

			const message = typeof error === 'object'
				? JSON.stringify(error)
				: String(error);

			await ctx.state.job.finish(200, message).save();

			ctx.body = error;
		});
});
