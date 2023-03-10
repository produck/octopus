import * as RJSP from '../RJSP/index.mjs';
import * as Options from './Options.mjs';
import * as Member from './Member.mjs';

export class Tentacle {
	#meta = Member.normalizeMeta();
	#server = Member.normalizeServer();
	#options = Options.normalize();

	constructor(_meta, _server, _options) {
		this.#meta = Member.normalizeMeta(_meta);
		this.#server = Member.normalizeServer(_server);
		this.#options = Options.normalize(_options);
	}

	#ready = true;
	#job = null;

	set ready(flag = true) {
		this.#ready = Boolean(flag);
	}

	get ready() {
		return this.#ready;
	}

	get job() {
		return this.#job;
	}

	get server() {
		return { ...this.#server };
	}

	#config = RJSP.Data.normalizeConfig();

	#client = new RJSP.Client({
		job: () => this.#job,
		host: () => this.#server.host,
		port: () => this.#server.port,
		timeout: () => this.#config.timeout,
	});

	#setConfig(config) {
		if (config.at > this.#config.at) {
			this.#options.on.config({ ...config });
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

			if (RJSP.Code.isOK(code)) {
				self.#options.on.sync.ok();
				self.#setConfig(body.config);
				await self.#setJob(body.job);
				done();
			} else {
				self.#options.on.sync.error(code);

				if (RJSP.Code.isRetrieable(code)) {
					setTimeout(() => retry(self), self.#config.interval);
				}

				if (RJSP.Code.isCritical(code)) {
					self.stop();
					self.#options.on.crash(code);
				}
			}
		})(this);

		return new Promise(resolve => done = resolve);
	}

	#active = false;

	get active() {
		return this.#active;
	}

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
