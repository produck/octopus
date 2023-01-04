import { AbstractOctopusJob } from './Abstract.mjs';

export const DATA = Symbol.for('Job.Data');

export class DeclarativeOctopusJob extends AbstractOctopusJob {
	/** @type {ReturnType<typeof import('./Data.mjs').normalize>} */
	[DATA] = null;

	#at(key) {
		const value = this[DATA][`${key}At`];

		return value === null ? null : new Date(value);
	}

	get id() {
		return this[DATA].id;
	}

	get visitedAt() {
		return this.#at('visited');
	}

	get createdAt() {
		return this.#at('created');
	}

	get assignedAt() {
		return this.#at('assigned');
	}

	get startedAt() {
		return this.#at('started');
	}

	get finishedAt() {
		return this.#at('finished');
	}

	get archivedAt() {
		return this.#at('archived');
	}

	get statusCode() {
		return this[DATA].statusCode;
	}

	get message() {
		return this[DATA].message;
	}
}
