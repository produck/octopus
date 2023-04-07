import * as net from 'node:net';
import { T, U } from '@produck/mold';

import * as Data from './Data.mjs';
import * as Options from './Options.mjs';

const throws = message => {
	throw new Error(message);
};

const Result = (code, body = null) => ({ code, body });

export class RJSPClient {
	get #FETCH_OPTIIONS() {
		const timeout = this.#options.timeout();

		if (!T.Helper.Integer(timeout)) {
			throw new Error('Bad timeout from `options.timeout()`, one integer expected.');
		}

		return {
			headers: {
				'Content-Type': 'application/json',
				'User-Agent': 'octopus-tentacle/*',
			},
			redirect: 'error',
			signal: AbortSignal.timeout(timeout),
		};
	}

	#options = Options.normalize();

	constructor(...args) {
		const options = Options.normalize(...args);

		this.#options = Object.freeze(options);
	}

	get #BASE_URL() {
		const host = this.#options.host();
		const port = this.#options.port();

		if (!T.Native.String(host)) {
			throws('Bad host from `options.host()`, one string expected.');
		}

		if (!T.Helper.Integer(port)) {
			throws('Bad host from `options.port()`, one integer expected.');
		}

		const finalHost = net.isIPv6(host) ? `[${host}]` : host;

		return `http://${finalHost}:${port}/api`;
	}

	get #JOB() {
		const job = this.#options.job();

		if (!T.Native.String(job)) {
			throws('Bad host from `options.job()`, one string expected.');
		}

		return job;
	}

	get #SYNC_URL() {
		return `${this.#BASE_URL}/sync`;
	}

	get #SOURCE_URL() {
		return `${this.#BASE_URL}/job/${this.#JOB}/source`;
	}

	get #TARGET_URL() {
		return `${this.#BASE_URL}/job/${this.#JOB}/target`;
	}

	get #ERROR_URL() {
		return `${this.#BASE_URL}/job/${this.#JOB}/error`;
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

		if (response.status === 400) {
			return Result(0x14);
		}

		if (response.status === 404) {
			return Result(0x11);
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

		if (response.status === 404) {
			return Result(0x11);
		}

		if (response.status === 423) {
			return Result(0x14);
		}

		return Result(0x10);
	}
}
