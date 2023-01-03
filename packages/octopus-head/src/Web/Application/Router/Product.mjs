import { S, P, Normalizer } from '@produck/mold';
import { defineRouter } from '@produck/duck-web-koa-forker';
import KoaBody from 'koa-body';

const StatusCodeSchem = P.Enum([0]);

const ProductDataSchema = S.Object({
	id: P.OrNull(P.String()),
	model: P.String(),
	createdAt: P.OrNull(P.String()),
	startedAt: P.OrNull(P.String()),
	finishedAt: P.OrNull(P.String()),
	statusCode: P.OrNull(StatusCodeSchem),
	message: P.OrNull(P.String()),
});

const normalizeProduct = Normalizer(ProductDataSchema);

function ProductData(product) {
	return {
		id: product.id,
		model: product.model.name,
		createdAt: product.createdAt,
		startedAt: product.startedAt,
		finishedAt: product.finishedAt,
		statusCode: product.statusCode,
		message: product.message,
	};
}

export const Router = defineRouter(function ProductRouter(router, {
	Workshop,
}) {
	router
		.param('productModel', function () {

		})
		.get(async function queryProductList(ctx) {
			const { application } = ctx.state;
			const list = await Workshop.queue.filter(application.id);

			ctx.body = list.map(ProductData);
		})
		.post(KoaBody(), async function createProduct(ctx) {
			const data = ctx.request.body;

			try {
				normalizeProduct(data);
			} catch {
				return ctx.throw(400, 'Bad request body.');
			}

			const product = await Workshop.create(data);

			ctx.body = ProductData(product);
		})
		.param('productId', async function fetchProduct(productId, ctx, next) {
			const product = await Workshop.get(productId);

			if (product === null) {
				return ctx.throw(404, `The product(${productId}) is NOT found.`);
			}

			ctx.state.product = product;

			return next();
		})
		.get('/{productId}', async function getProduct(ctx) {
			ctx.body = ProductData(ctx.state.product);
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
			ctx.body = ProductData(product);
		});
});
