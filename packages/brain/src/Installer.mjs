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
	Brain, Craft, Procedure, Product, Job, Tentacle, Options,
}) {
	async function evaluateProductProgress() {
		if (!await Options.isEvaluatable()) {
			return;
		}

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
					ok: status === Feature.Job.STATUS.OK,
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
	}

	async function matchJobToTentacle() {
		const allJobList = await Job.query();
		const allTentacleList = await Tentacle.query();
		const jobListByCraft = {};
		const updatingList = [];

		for (const job of allJobList) {
			if (!Object.hasOwn(jobListByCraft, job.craft)) {
				jobListByCraft[job.craft] = [];
			}

			jobListByCraft[job.craft].push(job);
		}

		for (const name in jobListByCraft) {
			const tentacleList = allTentacleList
				.filter(tentacle => tentacle.craft === name);

			if (tentacleList.length === 0) {
				continue;
			}

			const craft = Craft.use(name);
			const jobList = jobListByCraft[name];

			const matched = craft.evaluate(
				jobList.map(job => job.toValue()),
				tentacleList.map(tentacle => tentacle.toValue()),
			);

			for (const jobId in matched) {
				const tentacleId = matched[jobId];

				const tentacle = tentacleList
					.find(tentacle => tentacle.id === tentacleId);

				const job = jobList.find(job => job.id === jobId);

				updatingList.push(tentacle.pick(jobId).save());
				updatingList.push(job.start().save());
			}
		}

		await Promise.allSettled(updatingList);
	}

	Brain.on('grant', async () => {
		await evaluateProductProgress();
		await matchJobToTentacle();
	});
});

export const install = Duck.inject(function (Kit) {
	defineFeature(Kit);
	setProductEvaluator(Kit);
});
