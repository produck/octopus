import * as Duck from '@produck/duck';

export const evaluateProductProgress = Duck.inject(async ({
	Procedure, Product, Job,
}) => {
	const workingProductList = await Product.query();
	const crafts = {};

	const updatingList = workingProductList.map(async product => {
		const jobList = await Job.query();

		if (jobList.some(job => job.finishedAt === null)) {
			return;
		}

		const productId = product.id;
		const finished = {};

		for (const job of jobList) {
			const { id, status, message, target } = job;

			finished[id] = {
				id,
				ok: status === 100,
				error: message === null ? 'unknown' : message,
				target,
			};
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
			const jobCreatingList = result.creating.map(request => {
				return Job.create({ ...request, product: productId});
			});

			await Promise.all(jobCreatingList);
		}

		await product.save();
	});

	await Promise.allSettled(updatingList);
});

export { evaluateProductProgress as evaluate };
