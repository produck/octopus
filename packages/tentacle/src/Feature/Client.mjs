import { Normalizer, P, S, T, U } from '@produck/mold';

import * as RJSP from './RJSP.mjs';

const DEFAULT_TIMEOUT = 60000;

const OptionsSchema = S.Object({
	host: P.Function(() => '127.0.0.1'),
	port: P.Function(() => 9173),
	job: P.Function(() => null),
	timeout: P.Function(() => DEFAULT_TIMEOUT),
});

const normalizeOptions = Normalizer(OptionsSchema);

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

const Result = (code, data = null) => ({ code, data });

export class RJSPClient {
	constructor(_options) {
		const options = normalizeOptions(_options);

		this.options = Object.freeze(options);
	}

	get baseURL() {
		const host = this.options.host();
		const port = this.options.port();

		if (!T.Native.String(host)) {
			throws('Bad host from `options.host()`, one string expected.');
		}

		if (!T.Helper.Integer(port)) {
			throws('Bad host from `options.port()`, one integer expected.');
		}

		return `http://${host}:${port}`;
	}

	get SYNC_URL() {
		return `${this.baseURL}/api/sync`;
	}

	get JOB() {
		const job = this.options.job();

		if (!T.Native.String(job)) {
			throws('Bad host from `options.job()`, one string expected.');
		}

		return job;
	}

	get SOURCE_URL() {
		return `${this.baseURL}/api/${this.JOB}/source`;
	}

	get TARGET_URL() {
		return `${this.baseURL}/api/${this.JOB}/target`;
	}

	get ERROR_URL() {
		return `${this.baseURL}/api/${this.JOB}/error`;
	}

	get FETCH_OPTIIONS() {
		const timeout = this.options.timeout();

		if (T.Helper.Integer(timeout)) {
			throw new Error('Bad timeout from `options.timeout()`, one integer expected.');
		}

		return {
			...BASE_FETCH_OPTIONS,
			headers: { ...STATIC_HEADER },
		};
	}

	async sync(_requestData) {
		const requestData = RJSP.normalizeData(_requestData);

		const response = await fetch(this.SYNC_URL, {
			...this.FETCH_OPTIIONS,
			method: 'PUT',
			body: JSON.stringify(requestData),
			signal: AbortSignal.timeout(requestData.config.timeout),
		});

		if (response.status === 403) {
			throw new Error('Unavailable craft.');
		}

		const _responseData = await response.json();

		try {
			return Result(0x00, RJSP.normalizeData(_responseData));
		} catch (error) {
			// Invalid RJSP Server.
			return Result(0x20);
		}
	}

	async getSource() {
		const response = await fetch(this.SOURCE_URL, {
			...this.FETCH_OPTIIONS,
			method: 'GET',
		});

		if (response.ok) {
			return Result(0x00, await response.json());
		}

		if (response.status === 404) {
			return Result(0x10);
		}

		if (response.status === )
	}

	async setTarget(data) {
		if (!T.Native.Object(data)) {
			U.throwError('data', 'object');
		}

		const response = await fetch(this.TARGET_URL, {
			...this.FETCH_OPTIIONS,
			method: 'POST',
			body: JSON.stringify(data),
		});
	}

	async setError(message = null) {

	}
}
