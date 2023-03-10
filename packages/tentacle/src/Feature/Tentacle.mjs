import { webcrypto as crypto } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { Normalizer, P, S } from '@produck/mold';

import * as RJSP from './RJSP.mjs';
import { RJSPClient } from './client.mjs';

const MetaSchema = S.Object({
	id: P.String(crypto.randomUUID()),
	craft: P.String('org.produck.octopus.craft.example'),
	version: P.String('0.0.0'),
});

const ServerSchema = S.Object({
	host: RJSP.HostSchema,
	port: RJSP.PortSchema,
});

const OptionsSchema = S.Object({
	pick: P.Function(() => {}),
	free: P.Function(() => {}),
});

const normalizeMeta = Normalizer(MetaSchema);
const normalizeServer = Normalizer(ServerSchema);
const normalizeOptions = Normalizer(OptionsSchema);

export class Tentacle extends EventEmitter {
	constructor(_meta, _server, _options) {
		super();
		this.#meta = normalizeMeta(_meta);
		this.#server = normalizeServer(_server);
		this.#options = normalizeOptions(_options);
	}

	#ready = true;

	set ready(flag = true) {
		this.#ready = Boolean(flag);
	}

	get ready() {
		return this.#ready;
	}

	get busy() {
		return this.#job !== null;
	}

	#server = normalizeServer();
	#options = normalizeOptions();

	#client = new RJSPClient({
		job: () => this.#job,
		host: () => this.#server.host,
		port: () => this.#server.port,
		timeout: () => this.#config.timeout,
	});

	#meta = normalizeMeta();
	#config = RJSP.normalizeConfig();
	#job = false;

	#setConfig(config) {
		if (config.at > this.#config.at) {
			this.emit('config', { ...config });
			this.#config = config;
		}

		if (this.#config.redirect) {
			this.#server.host = this.#config.host;
			this.#server.port = this.#config.port;
			this.#config.at = 0;
			this.#config.redirect = false;
		}
	}

	async #setJob(job) {
		if (this.#job === job) {
			return;
		}

		if (this.#job !== null) {
			await this.#options.free(this.#job);
		}

		if (job !== null) {
			await this.#options.pick(job);
		}
	}

	async sync() {
		const data = {
			...this.#meta,
			ready: this.#ready,
			job: this.#job,
			config: { ...this.#config },
		};

		let done;

		(async function retry(self) {
			const { code, body } = await self.#client.sync(data);

			if (code !== 0x00) {
				self.emit('sync-error', code);

				return setTimeout(() => retry(self), self.#config.interval);
			}

			self.emit('sync-ok');
			self.#setConfig(body.config);
			await self.#setJob(body.job);
			done();
		})(this);

		return new Promise(resolve => done = resolve);
	}

	#active = false;

	start() {
		(async function loop(self) {
			if (!self.#active) {
				return;
			}

			await self.sync();
			setTimeout(() => loop(self), self.#config.interval);
		})(this);

		return this;
	}

	stop() {
		this.#active = false;

		return this;
	}
}
