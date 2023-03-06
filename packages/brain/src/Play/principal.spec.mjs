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

const Backend = {
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
		createdAt: 0, startedAt: 0, finishedAt: 0, message: '',
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
			get: id => {
				return Backend.Application.find(data => data.id === id) || null;
			},
		},
		PublicKey: {
			query: {
				OfOwner: ({ owner }) => {
					return Backend.PublicKey.filter(data => data.owner === owner);
				},
			},
		},
		Craft: {
			create: (data) => data,
		},
		Procedure: {
			create: (data) => data,
		},
		Product: {
			query: {
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
				All: ({ ordered, finished }) => {
					return Backend.Product.filter(data => {
						let flag = true;

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
				const data = {
					..._data,
					createdAt: Date.now(),
				};

				Backend.Product.push(data);

				return { ...data };
			},
		},
		Job: {
			get: id => Backend.Job.find(data => data.id === id) || null,
		},
		Brain: {

		},
		Tentacle: {

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
			const foo = Brain('6fcf3d0a-88fc-41fe-97c3-bfe39e19409d');

		});
	});

	describe('cluster', function () {

	});
});
