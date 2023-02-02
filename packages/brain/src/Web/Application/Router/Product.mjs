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

export const Router = defineRouter(function ProductRouter(router, {
	Environment, Workshop,
}) {
	router
		.param('productModel', function assertModel(productModel, ctx, next) {
			if (!Workshop.Model.has(productModel)) {
				return ctx.throw(404, `A model(${productModel}) is NOT found.`);
			}

			ctx.state.model = Workshop.Model.get(productModel);

			return next();
		})
		.get(async function queryProductList(ctx) {
			const { application } = ctx.state;

			ctx.body = await Workshop.Product.Queue.filter(application.id);
		})
		.post(KoaBody(), async function createProduct(ctx) {
			const waitingLength = await Workshop.Product.Queue.getWaitingLength();

			if (waitingLength > Environment.get('PRODUCT.QUEUE.MAX')) {
				return ctx.throw(429, 'Too many waiting product.');
			}

			const data = ctx.request.body;

			try {
				normalizeProduct(data);
			} catch {
				return ctx.throw(400, 'Bad request body.');
			}

			const product = await Workshop.Product.Queue.create(data);

			ctx.body = product;
		})
		.param('productId', async function fetchProduct(productId, ctx, next) {
			const product = await Workshop.Product.Queue.get(productId);

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
