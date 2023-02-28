import { P, S } from '@produck/mold';
import { webcrypto as crypto } from 'node:crypto';
import { defineRouter } from '@produck/duck-web-koa-forker';
import KoaBody from 'koa-body';

const StateSchema = S.Object({
	finished: P.Constant(true, true),
});

const isState = (data) => {
	try {
		StateSchema(data, false);

		return true;
	} catch(error) {
		return false;
	}
};

export const Router = defineRouter(function ProductRouter(router, {
	Environment, Procedure, Product,
}) {
	router
		.use(KoaBody.default())
		.param('productModel', function assertModel(productModel, ctx, next) {
			if (!Procedure.isValid(productModel)) {
				return ctx.throw(404, `Bad product model(${productModel}).`);
			}

			ctx.state.procedure = Procedure.use(productModel);

			return next();
		})
		.get(async function queryProductList(ctx) {
			const { application } = ctx.state;

			ctx.body = await Product.query({
				name: 'OfOwner',
				owner: application.id,
			});
		})
		.post(async function createProduct(ctx) {
			const list = await Product.query({
				name: 'All',
				started: false,
			});

			if (list.length >= Environment.get('PRODUCT.QUEUE.MAX')) {
				return ctx.throw(429, 'Too many waiting product.');
			}

			const { application, procedure } = ctx.state;

			ctx.status = 201;

			ctx.body = await Product.create({
				id: crypto.randomUUID(),
				owner: application.id,
				model: procedure.name,
			});
		})
		.param('productId', async function fetchProduct(productId, ctx, next) {
			const { application } = ctx.state;
			const product = await Product.get(productId);

			if (product === null || product.owner !== application.id) {
				return ctx.throw(404, `The product(${productId}) is NOT found.`);
			}

			ctx.state.product = product;

			return next();
		})
		.get('/{productId}', async function getProduct(ctx) {
			ctx.body = ctx.state.product;
		})
		.put('/{productId}/state', async function abort(ctx) {
			const { body: state } = ctx.request;

			if (!isState(state)) {
				return ctx.throw(400, 'Bad state.');
			}

			const { product } = ctx.state;

			if (product.finishedAt !== null) {
				return ctx.throw(403, 'Finished.');
			}

			await product.finish(202, 'By application.').save();
			ctx.body = { finished: true };
		});
});
