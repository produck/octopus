import { defineRouter } from '@produck/duck-web-koa-forker';

export const Router = defineRouter(function OrderRouter(router) {
	router
		.get(async function getProductArtifact(ctx) {
			const { product } = ctx.state;

			ctx.body = await product.getArtifact();
		});
});
