import { defineRouter } from '@produck/duck-web-koa-forker';
import KoaBody from 'koa-body';

export const Router = defineRouter(function ProductRouter(router, {
	Environment, Procedure, Product,
}) {
	router
		.param('productModel', function assertModel(productModel, ctx, next) {
			if (!Procedure.isValid(productModel)) {
				return ctx.throw(404, `A model(${productModel}) is NOT found.`);
			}

			ctx.state.model = Procedure.use(productModel);

			return next();
		})
		.get(async function queryProductList(ctx) {
			const { application } = ctx.state;

			ctx.body = await Product.query({
				name: 'OfOwner',
				owner: application.id,
			});
		})
		.post(KoaBody.default(), async function createProduct(ctx) {
			const waitingLength = await Product.getWaitingLength();

			if (waitingLength > Environment.get('PRODUCT.QUEUE.MAX')) {
				return ctx.throw(429, 'Too many waiting product.');
			}

			try {
				ctx.body = await Product.create(ctx.request.body);
			} catch {
				return ctx.throw(400, 'Bad request body.');
			}
		})
		.param('productId', async function fetchProduct(productId, ctx, next) {
			const product = await Product.get(productId);

			if (product === null) {
				return ctx.throw(404, `The product(${productId}) is NOT found.`);
			}

			ctx.state.product = product;

			return next();
		})
		.get('/{productId}', async function getProduct(ctx) {
			ctx.body = ctx.state.product;
		})
		.delete('/{productId}', async function deleteProduct(ctx) {
			const { product } = ctx.state;

			if (!product.isFinished) {
				await product.stop();
			}

			if (product.isDeleted) {
				return ctx.throw(404);
			}

			await product.delete();
			ctx.body = product;
		});
});
