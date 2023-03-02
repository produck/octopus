import * as Duck from '@produck/duck';

export const freeTentacle = Duck.inject(async ({
	Environment, Brain, Tentacle, Job,
}) => {
	const list = await Tentacle.query({ name: 'All', busy: true });
	const busyList = list.filter(tentacle => tentacle.job !== null);
	const worldNow = Brain.current.visitedAt;
	const aliveTimeout = Environment.get('TENTACLE.ALIVE.TIMEOUT');

	for (const tentacle of busyList) {
		const job = await Job.get(tentacle.job);
		const alive = worldNow - tentacle.visitedAt < aliveTimeout;

		if (job === null || job.finishedAt !== null || !alive) {
			await tentacle.free().save();
		}

		if (!alive && job.finishedAt !== null) {
			await job.finish(200, 'Agent disconnection.').save();
		}
	}
});

export { freeTentacle as free };
