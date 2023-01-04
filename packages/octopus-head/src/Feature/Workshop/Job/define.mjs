import { BaseOctopusJob } from './Base.mjs';

export function defineJob(options) {
	const JOB_CLASS_NAME = '';

	const CustomOctopusJob = { [JOB_CLASS_NAME]: class extends BaseOctopusJob {

	} }[JOB_CLASS_NAME];

	return CustomOctopusJob;
}
