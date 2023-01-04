import * as Data from './Data.mjs';
import { DeclarativeOctopusJob, DATA } from './Declarative.mjs';

export class BaseOctopusJob extends DeclarativeOctopusJob {
	#dirty = false;

	constructor(id) {
		super();
		this[DATA] = Data.normalize({ id });
	}

	async #save() {
		if (this.#dirty) {
			throw new Error('This job is loading.');
		}

		this.#dirty = true;
		await this._save(Data.normalize(this[DATA]));
		this.#dirty = false;
	}

	async load() {
		this.#dirty = true;

		const _data = await this._load(this.id);

		this[DATA] = this._strict ? Data.normalize(_data) : _data;
		this.#dirty = false;
	}

	async visit() {
		if (this.createdAt === null) {
			throw new Error('This job is NOT loaded.');
		}

		this[DATA].visitedAt = Date.now();
		await this.#save();
	}

	async assign() {
		if (this.createdAt === null) {
			throw new Error('This job is NOT loaded.');
		}

		if (this.assignedAt !== null) {
			throw new Error('This job has been assigned.');
		}

		this[DATA].assignedAt = Date.now();
		await this.#save();
	}

	async start() {
		if (this.assignedAt === null) {
			throw new Error('This job is NOT assigned.');
		}

		if (this.startedAt !== null) {
			throw new Error('This job has been started.');
		}

		this[DATA].startedAt = Date.now();
		await this.#save();
	}

	async finish(statusCode, message = null) {
		if (this.createdAt === null) {
			throw new Error('This job is NOT loaded.');
		}

		this[DATA].statusCode = Data.normalizeStatusCode(statusCode);
		this[DATA].message = Data.normalizeMessage(message);
		this[DATA].finishedAt = Date.now();

		await this.#save();
	}

	async archive() {
		await this.#save();
	}
}
