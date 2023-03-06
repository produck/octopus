import * as Duck from '@produck/duck';

export const clearExpiredProuct = Duck.inject(async ({
	Brain, Environment, Product,
}) => {
	const now = Brain.current.visitedAt;
	const timeout = Environment.get('PRODUCT.ORDER.TIMEOUT');
	const list = await Product.query({ name: 'All', ordered: false });
	const expiredList = list.filter(product => now - product.createdAt >= timeout);

	for (const product of expiredList) {
		await product.finish(201).save();
	}
});

export const evaluateProductProgress = Duck.inject(async ({
	Procedure, Product, Job, Craft,
}) => {
	const workingProductList = await Product.query({
		name: 'All', finished: false, ordered: true,
	});

	const crafts = {};

	for (const name of Craft.names) {
		const craft = Craft.use(name);

		crafts[name] = source => craft.isSource(source);
	}

	const promiseList = workingProductList.map(async product => {
		const productId = product.id;
		const jobList = await Job.query({ name: 'OfProduct', product: productId });

		if (jobList.some(job => job.finishedAt === null)) {
			return;
		}

		const finished = {};

		for (const job of jobList) {
			const { id, status, message, target } = job;

			finished[id] = { id, ok: status === 100, target, error: message };
		}

		const { model, order, dump } = product;
		const procedure = Procedure.use(model);
		const result = procedure.evaluate(order, { dump, finished, crafts });

		if (result.done) {
			if (result.ok) {
				product.complete(result.artifact);
			} else {
				product.finish(200, result.error);
			}

			product.dump = null;
		} else {
			const jobCreatingList = result.creating
				.map(request => Job.create({ ...request, product: productId}));

			product.dump = result.dump;
			await Promise.all(jobCreatingList);
		}

		await product.save();
	});

	await Promise.allSettled(promiseList);
});

export { evaluateProductProgress as evaluate };
