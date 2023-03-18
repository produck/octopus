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

function toProductValueObject(product) {
	return {
		id: product.id,
		model: product.model,
		createdAt: product.createdAt,
		orderedAt: product.orderedAt,
		finishedAt: product.finishedAt,
		status: product.status,
		message: product.message,
	};
}

export const Router = defineRouter(function ProductRouter(router, {
	Environment, Procedure, Product, Job,
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
			}).then(list => list.map(toProductValueObject));
		})
		.post(async function createProduct(ctx) {
			const list = await Product.query({ name: 'All', finished: false });

			if (list.length >= Environment.get('PRODUCT.QUEUE.MAX')) {
				return ctx.throw(429, 'Too many waiting product.');
			}

			const { application, procedure } = ctx.state;

			const product = await Product.create({
				id: crypto.randomUUID(),
				owner: application.id,
				model: procedure.name,
			});

			ctx.status = 201;
			ctx.body = toProductValueObject(product);
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
			ctx.body = toProductValueObject(ctx.state.product);
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

			const jobList = await Job.query({
				name: 'OfProduct',
				product: product.id,
				finished: false,
			});

			await Promise.all(jobList.map(job => job.finish(202).save()));

			ctx.body = { finished: true };
		});
});
