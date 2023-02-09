import { Normalizer, P, S } from '@produck/mold';

export const FIFO = ({ Job, Tentacle, assign }) => {
	const sortedJobList = Job.list.sort((a, b) => b.createdAt - a.createdAt);
	const tentacleList = Tentacle.list;

	while (sortedJobList.length > 0 && tentacleList.length > 0) {
		const jobId = sortedJobList.pop().id;
		const tentacleId = tentacleList.pop().id;

		assign(jobId, tentacleId);
	}
};

export const OptionsSchemaOptions = {
	policy: P.Function(FIFO),
	source: P.Function(() => true),
	target: P.Function(() => true),
};

export const OptionsSchema = S.Object(OptionsSchemaOptions);
export const normalizeOptions = Normalizer(OptionsSchema);

export const Schema = S.Object({
	name: P.String(),
	...OptionsSchemaOptions,
});

export const normalize = Normalizer(Schema);
