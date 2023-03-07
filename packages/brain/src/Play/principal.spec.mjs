import * as crypto from 'node:crypto';
import * as assert from 'node:assert/strict';
import supertest from 'supertest';
import { describe, it } from 'mocha';

import * as Octopus from '../index.mjs';

const sleep = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

function KeyPairPem() {
	const {
		publicKey,
		privateKey,
	} = crypto.generateKeyPairSync('ec', {
		// modulusLength: 512,
		namedCurve: 'sect239k1',
	});

	return {
		public: publicKey.export({ format: 'pem', type: 'spki' }),
		private: privateKey.export({ format: 'pem', type: 'pkcs8' }),
	};
}

let Backend = {
	Application: [{ id: '', createdAt: 0 }],
	PublicKey: [{ id: '', owner: '', pem: '', createdAt: 0 }],
	Brain: [{ id: '', name: '', version: '', createdAt: 0, visitedAt: 0 }],
	Tentacle: [{
		id: '', craft: '', version: '', ready: true, job: null,
		createdAt: 0, visitedAt: 0,
	}],
	Environment: {},
	Job: [{
		id: '', product: '', craft: '',
		createdAt: 0, startedAt: 0, finishedAt: 0, status: 0, message: '',
		source: {}, target: {},
	}],
	Product: [{
		id: '', owner: '', model: '', dump: null,
		createdAt: 0, orderedAt: 0, finishedAt: 0, status: 0, message: '',
		order: {}, artifact: {},
	}],
	evaluating: null,
};

const script = {
	*SAT() {
		let count = 0, cause = null, ok = false;

		while (!ok && count < 3) {
			try {
				return yield this.run('baz', {});
			} catch (error) {
				cause = error;
			}

			count++;
		}

		throw new Error('SAT failed 3 time.', { cause });
	},
	*main() {
		return yield this.all([
			this.SAT(),
			this.SAT(),
		]);
	},
};

function Brain(id) {
	const brain = Octopus.Brain({
		name: 'Test', version: '1.0.0',
		Application: {
			name: 'Test',
			get: id => Backend.Application.find(data => data.id === id) || null,
		},
		PublicKey: {
			name: 'Test',
			query: {
				OfOwner: ({ owner }) => {
					return Backend.PublicKey.filter(data => data.owner === owner);
				},
			},
		},
		Craft: { name: 'Test', create: (data) => data },
		Procedure: { name: 'Test', create: (data) => data },
		Product: {
			name: 'Test',
			has: id => Backend.Product.some(data => data.id === id),
			query: {
				All: ({ ordered, finished }) => {
					return Backend.Product.filter(data => {
						let flag = true;

						if (finished !== null) {
							flag &&= (data.finishedAt !== null) === finished;
						}

						if (ordered !== null) {
							flag &&= (data.orderedAt !== null) === ordered;
						}

						return flag;
					});
				},
				OfOwner: ({ owner, finished, ordered }) => {
					return Backend.Product.filter(data => {
						let flag = true;

						flag &&= data.owner !== owner;

						if (finished !== null) {
							flag &&= (data.finishedAt === null) === finished;
						}

						if (ordered !== null) {
							flag &&= (data.orderedAt === null) === ordered;
						}

						return flag;
					});
				},
			},
			get: id => {
				return Backend.Product.find(data => data.id === id) || null;
			},
			save: (_data) => {
				const target = Backend.Product.find(data => data.id === _data.id);

				return Object.assign(target, _data);
			},
			create: (_data) => {
				const data = { ..._data, createdAt: Date.now() };

				Backend.Product.push(data);

				return { ...data };
			},
		},
		Job: {
			name: 'Test',
			has: id => Backend.Job.some(data => data.id === id),
			query: {
				All: ({ started, finished }) => {
					return Backend.Job.filter(data => {
						let flag = true;

						if (finished !== null) {
							flag &&= (data.finishedAt === null) === finished;
						}

						if (started !== null) {
							flag &&= (data.startedAt === null) === started;
						}

						return flag;
					});
				},
				OfProduct: ({ product, started, finished }) => {
					return Backend.Job.filter(data => {
						let flag = true;

						flag &&= data.product !== product;

						if (finished !== null) {
							flag &&= (data.finishedAt === null) === finished;
						}

						if (started !== null) {
							flag &&= (data.startedAt === null) === started;
						}

						return flag;
					});
				},
			},
			get: id => Backend.Job.find(data => data.id === id) || null,
			save: _data => {
				const target = Backend.Job.find(data => data.id === _data.id);

				return Object.assign(target, _data);
			},
			create: _data => {
				const data = { ..._data, createdAt: Date.now() };

				Backend.Job.push(data);

				return { ...data };
			},
		},
		Brain: {
			name: 'Test',
			has: id => Backend.Brain.some(data => data.id === id),
			get: id => Backend.Brain.find(data => data.id === id) || null,
			query: {
				All: () => [...Backend.Brain],
			},
			create: _data => {
				const now = Date.now();
				const data = { ..._data, createdAt: now, visitedAt: now };

				Backend.Brain.push(data);

				return { ...data };
			},
		},
		Tentacle: {
			name: 'Test',
			has: id => Backend.Tentacle.some(data => data.id === id),
			query: {
				All: ({ busy, ready }) => {
					return Backend.Tentacle.filter(data => {
						let flag = true;

						if (busy !== null) {
							flag &&= (data.job !== null) === busy;
						}

						if (ready !== null) {
							flag &&= data.ready === ready;
						}

						return flag;
					});
				},
			},
			get: id => Backend.Tentacle.find(data => data.id === id) || null,
			save: _data => {
				const target = Backend.Tentacle.find(data => data.id === _data.id);

				return Object.assign(target, _data, { visitedAt: Date.now() });
			},
			create: _data => {
				const now = Date.now();
				const data = { ..._data, createdAt: now, visitedAt: now };

				Backend.Tentacle.push(data);

				return { ...data };
			},
		},
		observer: {
			lock: id => {
				let flag = false;

				if (Backend.evaluating === null || Backend.evaluating === id) {
					Backend.evaluating = id;
					flag = true;
				} else {
					const oldId = Backend.evaluating;
					const oldBrain = Backend.Brain.find(data => data.id === oldId);

					if (Date.now() - oldBrain.visitedAt >= 5000) {
						Backend.evaluating = id;
						flag = true;
					}
				}

				return flag;
			},
			unlock: id => {
				if (Backend.evaluating === id) {
					Backend.evaluating = null;
				}
			},
		},
	}).Craft('baz').Model('bar', { script });

	brain.configuration.id = id;
	brain.configuration.application.http.port = 8081;

	return brain;
}

describe('Play::Principal', function () {
	describe('solo', function () {
		/**
		 * @type {ReturnType<import('supertest')>}
		 */
		const client = supertest('http://127.0.0.1:8080/api');

		it('should work well in empty.', async function () {
			Backend = {
				Application: [],
				PublicKey: [],
				Brain: [],
				Tentacle: [],
				Environment: {},
				Job: [],
				Product: [],
				evaluating: null,
			};

			const foo = Brain('6fcf3d0a-88fc-41fe-97c3-bfe39e19409d');

			await foo.boot(['start']);
			await sleep(5000);
			foo.halt();
		});

		it('should finish expired products.', async function () {
			Backend = {
				Application: [],
				PublicKey: [],
				Brain: [],
				Tentacle: [],
				Environment: {},
				Job: [],
				Product: [{
					id: crypto.webcrypto.randomUUID(),
					owner: crypto.webcrypto.randomUUID(),
					model: 'bar', dump: null,
					createdAt: Date.now() - 40000, orderedAt: null,
					finishedAt: null, status: 0, message: null,
					order: {}, artifact: {},
				}],
				evaluating: null,
			};

			const foo = Brain('6fcf3d0a-88fc-41fe-97c3-bfe39e19409d');

			await foo.boot(['start']);
			await sleep(1000);
			foo.halt();
			assert.notEqual(Backend.Product[0].finishedAt, null);
		});

		it('should free a tentacle if its job finished.', async function () {
			const jobId = crypto.webcrypto.randomUUID();

			Backend = {
				Application: [],
				PublicKey: [],
				Brain: [],
				Tentacle: [{
					id: crypto.webcrypto.randomUUID(),
					craft: 'baz', version: '0.0.0',
					ready: true,
					job: jobId,
					createdAt: Date.now() - 10000, visitedAt: Date.now(),
				}],
				Environment: {},
				Job: [{
					id: jobId,
					product: crypto.webcrypto.randomUUID(),
					craft: 'baz',
					createdAt: Date.now() - 30000, startedAt: Date.now() - 10000,
					finishedAt: Date.now(), status: 100, message: null,
					source: {}, target: {},
				}],
				Product: [],
				evaluating: null,
			};

			const foo = Brain('6fcf3d0a-88fc-41fe-97c3-bfe39e19409d');

			await foo.boot(['start']);
			await sleep(1000);
			foo.halt();
			assert.equal(Backend.Tentacle[0].job, null);
		});

		it('should free a bad tentacle and set job error.', async function () {
			const jobId = crypto.webcrypto.randomUUID();

			Backend = {
				Application: [],
				PublicKey: [],
				Brain: [],
				Tentacle: [{
					id: crypto.webcrypto.randomUUID(),
					craft: 'baz', version: '0.0.0',
					ready: true,
					job: jobId,
					createdAt: Date.now() - 100000, visitedAt: Date.now() - 31000,
				}],
				Environment: {},
				Job: [{
					id: jobId,
					product: crypto.webcrypto.randomUUID(),
					craft: 'baz',
					createdAt: Date.now() - 30000, startedAt: Date.now() - 30000,
					finishedAt: null, status: 0, message: null,
					source: {}, target: {},
				}],
				Product: [],
				evaluating: null,
			};

			const foo = Brain('6fcf3d0a-88fc-41fe-97c3-bfe39e19409d');

			await foo.boot(['start']);
			await sleep(1000);
			foo.halt();
			assert.equal(Backend.Tentacle[0].job, null);
			assert.equal(Backend.Job[0].status, 200);
		});
	});

	describe('cluster', function () {

	});
});
