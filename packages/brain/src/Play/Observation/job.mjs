import * as Duck from '@produck/duck';

export const assignJobToTentacle = Duck.inject(async ({
	Craft, Tentacle, Job,
}) => {
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
});

export { assignJobToTentacle as assign };
