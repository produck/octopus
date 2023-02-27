import { defineRouter } from '@produck/duck-web-koa-forker';

export const Router = defineRouter(function OrderRouter(router) {
	router
		.get(async function getProductArtifact(ctx) {
			const { product } = ctx.state;

			if (product.finished === null) {
				return ctx.throw(404, 'The product is NOT finished.');
			}

			if (product.status !== 100) {
				return ctx.throw(404, 'The product failed.');
			}

			ctx.body = product.artifact;
		});
});
