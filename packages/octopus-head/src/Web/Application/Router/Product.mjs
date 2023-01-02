
import { defineRouter } from '@produck/duck-web-koa-forker';

export const Router = defineRouter(function ProductRouter(router, {

}) {
	router
		.get(async function queryProductList() {

		})
		.post(async function createProduct() {

		})
		.param('productId', async function getProduct(id, ctx, next) {

			return next();
		})
		.get('/{productId}', async function updateProduct() {

		});
		.put('/{productId}', async function updateProduct() {

		});
});
