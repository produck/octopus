import { T, U } from '@produck/mold';
import { RecordSet } from './RecordSet.mjs';

const NULL_RECORD_SET = new RecordSet();

export class Evaluator {
	#matched = null;
	#Job = NULL_RECORD_SET;
	#Tentacle = NULL_RECORD_SET;

	#assign(jobId, tentacleId) {
		if (!T.Native.String(jobId)) {
			U.throwError('jobId', 'string');
		}

		if (!T.Native.String(tentacleId)) {
			U.throwError('tentacleId', 'string');
		}

		if (!this.#Job.has(jobId)) {
			throw new Error(`Non-existent job(${jobId}).`);
		}

		if (!this.#Tentacle.has(tentacleId)) {
			throw new Error(`Non-existent tentacle(${tentacleId}).`);
		}

		this.#matched[jobId] = tentacleId;
	}

	constructor(jobList, tentacleList, matched) {
		this.#matched = matched;
		this.#Job = new RecordSet(jobList);
		this.#Tentacle = new RecordSet(tentacleList);
		this.assign = (...args) => this.#assign(...args);
		Object.freeze(this);
	}

	get Job() {
		return this.#Job;
	}

	get Tentacle() {
		return this.#Tentacle;
	}
}
