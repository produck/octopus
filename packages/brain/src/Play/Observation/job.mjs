import * as Duck from '@produck/duck';

export const clearDeadJob = Duck.inject(async ({
	Tentacle, Job,
}) => {

});

export const assignJobToTentacle = Duck.inject(async ({
	Brain, Craft, Tentacle, Job, Environment,
}) => {
	const now = Brain.current.visitedAt;
	const timeout = Environment.get('TENTACLE.ALIVE.TIMEOUT');
	const Group = {};

	Craft.names.forEach(name => Group[name] = {
		craft: Craft.use(name),
		tentacles: [],
		jobs: [],
	});

	await Job.query({ name: 'All', started: false }).then(list => {
		for (const job of list) {
			Group[job.craft].jobs.push(job);
		}
	});

	await Tentacle.query({ name: 'All', busy: false }).then(list => {
		const alives = list
			.filter(tentacle => !tentacle.ready)
			.filter(tentacle => now - tentacle.visitedAt < timeout);

		for (const tentacle of alives) {
			Group[tentacle.craft].tentacles.push(tentacle);
		}
	});

	const promiseList = [];

	for (const name in Group) {
		const { tentacles, jobs, craft } = Group[name];

		if (tentacles.length === 0 || jobs === 0) {
			continue;
		}

		const matched = craft.evaluate(
			jobs.map(job => job.toValue()),
			tentacles.map(tentacle => tentacle.toValue()),
		);

		for (const jobId in matched) {
			const tentacleId = matched[jobId];
			const tentacle = tentacles.find(tentacle => tentacle.id === tentacleId);
			const job = jobs.find(job => job.id === jobId);

			promiseList.push(tentacle.pick(jobId).save());
			promiseList.push(job.start().save());
		}
	}

	await Promise.all(promiseList);
});

export {
	assignJobToTentacle as assign,
	clearDeadJob as clear,
};
