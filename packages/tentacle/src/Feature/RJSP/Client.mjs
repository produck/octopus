import { T, U } from '@produck/mold';

import * as Data from './Data.mjs';
import * as Options from './Options.mjs';

const STATIC_HEADER = {
	'Content-Type': 'application/json',
	'User-Agent': 'octopus-tentacle/*',
};

const BASE_FETCH_OPTIONS = {
	redirect: 'error',
};

const throws = message => {
	throw new Error(message);
};

const Result = (code, body = null) => ({ code, body });

export class RJSPClient {
	#options = Options.normalize();

	constructor(_options) {
		const options = Options.normalize(_options);

		this.#options = Object.freeze(options);
	}

	get #baseURL() {
		const host = this.#options.host();
		const port = this.#options.port();

		if (!T.Native.String(host)) {
			throws('Bad host from `options.host()`, one string expected.');
		}

		if (!T.Helper.Integer(port)) {
			throws('Bad host from `options.port()`, one integer expected.');
		}

		return `http://${host}:${port}`;
	}

	get #JOB() {
		const job = this.#options.job();

		if (!T.Native.String(job)) {
			throws('Bad host from `options.job()`, one string expected.');
		}

		return job;
	}

	get #SYNC_URL() {
		return `${this.#baseURL}/api/sync`;
	}

	get #SOURCE_URL() {
		return `${this.#baseURL}/api/${this.#JOB}/source`;
	}

	get #TARGET_URL() {
		return `${this.#baseURL}/api/${this.#JOB}/target`;
	}

	get #ERROR_URL() {
		return `${this.#baseURL}/api/${this.#JOB}/error`;
	}

	get #FETCH_OPTIIONS() {
		const timeout = this.#options.timeout();

		if (T.Helper.Integer(timeout)) {
			throw new Error('Bad timeout from `options.timeout()`, one integer expected.');
		}

		return {
			...BASE_FETCH_OPTIONS,
			headers: { ...STATIC_HEADER },
			signal: AbortSignal.timeout(timeout),
		};
	}

	async sync(_requestData) {
		const requestData = Data.normalize(_requestData);

		const response = await fetch(this.#SYNC_URL, {
			...this.#FETCH_OPTIIONS,
			method: 'PUT',
			body: JSON.stringify(requestData),
		}).catch(() => null);

		if (response === null) {
			return Result(0x21);
		}

		if (response.ok) {
			try {
				const _responseData = await response.json();

				return Result(0x01, Data.normalize(_responseData));
			} catch {
				return Result(0x22);
			}
		}

		if (response.status === 403) {
			return Result(0x41);
		}

		return Result(0x20);
	}

	async getSource() {
		const response = await fetch(this.#SOURCE_URL, {
			...this.#FETCH_OPTIIONS,
			method: 'GET',
		}).catch(() => null);

		if (response === null) {
			return Result(0x21);
		}

		if (response.ok) {
			try {
				return Result(0x02, await response.json());
			} catch {
				return Result(0x12);
			}
		}

		if (response.status === 404) {
			return Result(0x11);
		}

		return Result(0x10);
	}

	async setTarget(data) {
		if (!T.Native.Object(data)) {
			U.throwError('data', 'object');
		}

		const response = await fetch(this.#TARGET_URL, {
			...this.#FETCH_OPTIIONS,
			method: 'POST',
			body: JSON.stringify(data),
		}).catch(() => null);

		if (response === null) {
			return Result(0x21);
		}

		if (response.ok) {
			try {
				return Result(0x03, await response.json());
			} catch {
				return Result(0x13);
			}
		}

		if (response.status === 423) {
			return Result(0x14);
		}

		return Result(0x10);
	}

	async setError(message = null) {
		if (!T.Native.String(message) && !T.Helper.Null(message)) {
			U.throwError('message', 'string or null');
		}

		const response = await fetch(this.#ERROR_URL, {
			...this.#FETCH_OPTIIONS,
			method: 'POST',
			body: JSON.stringify({ message }),
		}).catch(() => null);

		if (response === null) {
			return Result(0x21);
		}

		if (response.ok) {
			try {
				return Result(0x04, await response.json());
			} catch {
				return Result(0x14);
			}
		}

		if (response.status === 423) {
			return Result(0x14);
		}

		return Result(0x10);
	}
}
