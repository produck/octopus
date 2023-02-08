import { Normalizer, P, S } from '@produck/mold';

export const FIFO = ({ Job, Tentacle, assign }) => {
	const sortedJobList = Job.list.sort((a, b) => b.createdAt - a.createdAt);

	while (sortedJobList.length > 0 && Job.list.length > 0) {
		const agentId = Tentacle.list.pop().id;
		const jobId = Job.list.pop().id;

		assign(agentId, jobId);
	}
};

export const Schema = S.Object({
	name: P.String(),
	policy: P.Function(FIFO),
	source: P.Function(() => true),
	target: P.Function(() => true),
});

export const normalize = Normalizer(Schema);
