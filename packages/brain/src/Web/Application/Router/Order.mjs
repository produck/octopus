import { defineRouter } from '@produck/duck-web-koa-forker';

export const Router = defineRouter(function OrderRouter(router) {
	router
		.post(async function createProductOrder(ctx) {
			const { product, procedure } = ctx.state;

			if (product.orderedAt !== null) {
				return ctx.throw(403, 'The product has been ordered.');
			}

			if (product.finishedAt !== null) {
				return ctx.throw(403, 'The product has been finished.');
			}

			const { body: order } = ctx.request;

			if (!procedure.isOrder(order)) {
				return ctx.throw(400, 'Bad order.');
			}

			ctx.body = await product.setOrder(order).save();
		})
		.get(async function getProductOrder(ctx) {
			const { product } = ctx.state;

			if (product.orderedAt === null) {
				return ctx.throw(404, 'There is no order of the product.');
			}

			ctx.body = product.order;
		});
});
