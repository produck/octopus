import { defineRouter } from '@produck/duck-web-koa-forker';

export const Router = defineRouter(function OrderRouter(router, {
	Environment,
}) {
	router
		.use(async function fetchProductOrder(ctx, next) {
			ctx.state.order = await ctx.state.product.setOrder(ctx.request.body);

			return next();
		})
		.post(async function createProductOrder(ctx) {
			const { order } = ctx.state;

			if (order !== null) {
				return ctx.throw(423, 'Order has been created.');
			}

			ctx.body = order;
		})
		.get(async function getProductOrder(ctx) {
			ctx.body = ctx.state.order;
		});
});
