import * as Duck from '@produck/duck';

export const assignJobToTentacle = Duck.inject(async ({
	Brain, Craft, Tentacle, Job, Environment,
}) => {
	const now = Brain.current.visitedAt;
	const aliveTimeout = Environment.get('TENTACLE.ALIVE.TIMEOUT');

	const notStartedJobList = await Job.query({ name: 'All', started: false });
	const idleTentacleList = await Tentacle.query({ name: 'All', busy: false });

	const aliveTentacleList = idleTentacleList
		.filter(tentacle => now - tentacle.visitedAt < aliveTimeout);

	if (notStartedJobList.length === 0 || aliveTentacleList.length === 0) {
		return;
	}

	const jobListByCraft = {};

	for (const job of notStartedJobList) {
		if (!Object.hasOwn(jobListByCraft, job.craft)) {
			jobListByCraft[job.craft] = [];
		}

		jobListByCraft[job.craft].push(job);
	}

	const promiseList = [];

	for (const name in jobListByCraft) {
		const tentacleList = aliveTentacleList
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

			promiseList.push(tentacle.pick(jobId).save());
			promiseList.push(job.start().save());
		}
	}

	await Promise.allSettled(promiseList);
});

export { assignJobToTentacle as assign };
