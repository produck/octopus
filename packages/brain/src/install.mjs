import * as Duck from '@produck/duck';
import * as Feature from './Feature/index.mjs';

export const defineFeature = Duck.inject(function ({
	Kit, Options,
}) {
	Kit.Application = Feature.Application.define(Options.Application);
	Kit.Brain = Feature.Application.define(Options.Brain);
	Kit.Craft = Feature.Craft.define(Options.Craft);
	Kit.Environment = Feature.Environment.define(Options.Environment);
	Kit.Job = Feature.Job.define(Options.Job);
	Kit.Procedure = Feature.Procedure.define(Options.Procedure);
	Kit.Product = Feature.Product.define(Options.Product);
	Kit.PublikKey = Feature.PublicKey.define(Options.PublicKey);
	Kit.Tentacle = Feature.Tentacle.define(Options.Tentacle);
});

export const setProductEvaluator = Duck.inject(function ({
	Brain, Craft, Procedure, Product, Job, Options,
}) {
	const isJobNotDone = job => job.finishedAt === null;
	const jobToRecord = job => ({ id: job.id, target: job.target });

	Brain.on('grant', async () => {
		if (!await Options.isEvaluatable()) {
			return;
		}

		const workingProductList = await Product.query();
		const crafts = {};

		const updatingList = workingProductList.map(async product => {
			const jobList = await Job.query();

			if (jobList.some(isJobNotDone)) {
				return;
			}

			const productId = product.id;
			const finished = {};

			for (const job of jobList) {
				const { id, status, message, target } = job;

				finished[id] = {
					id,
					ok: status === Feature.Job.STATUS.OK,
					error: message === null ? 'unknown' : message,
					target,
				};
			}

			const { model, order, dump } = product;
			const result = Procedure.evaluate(model, order, { dump, finished, crafts });

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
});

export const install = Duck.inject(function (Kit) {
	defineFeature(Kit);
	setProductEvaluator(Kit);
});
