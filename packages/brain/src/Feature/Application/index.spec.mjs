import { webcrypto as crypto } from 'node:crypto';
import * as assert from 'node:assert/strict';
import { describe, it } from 'mocha';

import { define } from './index.mjs';

const ID_EXAMPLE = crypto.randomUUID();

describe('::Feature::Application', function () {
	describe('::defineApplication()', function () {
		it('should create a CustomApplication.', function () {
			const CustomApplication = define();

			assert.equal(CustomApplication.name, 'CustomApplicationProxy');
		});
	});

	describe('::MemoneryApplication', function () {
		const SAMPLE_OPTIONS = { name: 'Memonery' };

		describe('::has()', function () {
			it('should get true.', async function () {
				const MemoneryApplication = define({
					...SAMPLE_OPTIONS,
					has: () => true,
				});

				assert.equal(await MemoneryApplication.has(ID_EXAMPLE), true);
			});

			it('should get false.', async function () {
				const MemoneryApplication = define({
					...SAMPLE_OPTIONS,
					has: () => false,
				});

				assert.equal(await MemoneryApplication.has(ID_EXAMPLE), false);
			});

			it('should throw if bad has().', async function () {
				const MemoneryApplication = define({
					...SAMPLE_OPTIONS,
					has: () => null,
				});

				await assert.rejects(() => MemoneryApplication.has(ID_EXAMPLE), {
					name: 'ApplicationImplementError',
					message: 'Bad Application flag when has(), one boolean expected.',
				});
			});
		});

		describe('::get()', function () {
			it('should get a application.', async function () {
				const example = { id: crypto.randomUUID(), createdAt: Date.now() };

				const MemoneryApplication = define({
					...SAMPLE_OPTIONS,
					get: () => example,
				});

				const application = await MemoneryApplication.get(ID_EXAMPLE);

				assert.equal(application.id, example.id);
			});

			it('should get a null.', async function () {
				const MemoneryApplication = define({
					...SAMPLE_OPTIONS,
					get: () => null,
				});

				const application = await MemoneryApplication.get(ID_EXAMPLE);

				assert.equal(application, null);
			});
		});

		describe('::query()', function () {
			it('should get a []', async function () {
				const MemoneryApplication = define({
					...SAMPLE_OPTIONS,
				});

				assert.deepEqual(await MemoneryApplication.query(), []);
			});

			it('should get a [Application]', async function () {
				const id = crypto.randomUUID();

				const MemoneryApplication = define({
					...SAMPLE_OPTIONS,
					query: () => [{ id, createdAt: Date.now() }],
				});

				const list = await MemoneryApplication.query();

				assert.equal(list.length, 1);
				assert.equal(list[0].id, id);
			});
		});

		describe('::create()', function () {
			it('should create a new application.', async function () {
				const example = { id: crypto.randomUUID(), createdAt: Date.now() };
				const store = [example];

				const MemoneryApplication = define({
					...SAMPLE_OPTIONS,
					create: async function createApplication(_data) {
						store.push({ ..._data });

						return { ..._data };
					},
				});

				await MemoneryApplication.create({
					id: crypto.randomUUID(),
					createdAt: Date.now(),
				});

				assert.equal(store.length, 2);
			});

			it('should throw if bad create().', async function () {
				const MemoneryApplication = define({
					...SAMPLE_OPTIONS,
					create: () => null,
				});

				await assert.rejects(async () => await MemoneryApplication.create({
					id: crypto.randomUUID(),
					createdAt: Date.now(),
				}), {
					name: 'ApplicationImplementError',
					message: 'Bad Application data.',
				});
			});
		});

		describe('.load()', function () {
			it('should update value.', async function () {
				const example = { id: crypto.randomUUID(), createdAt: Date.now() };
				const newId = crypto.randomUUID();

				assert.notEqual(example.id, newId);

				const MemoneryApplication = define({
					...SAMPLE_OPTIONS,
					get: () => ({ ...example }),
				});

				const application = await MemoneryApplication.get(ID_EXAMPLE);

				assert.equal(application.id, example.id);
				example.id = newId;
				await application.load();
				assert.equal(application.id, newId);
			});

			it('should be destroyed.', async function () {
				let fetched = false;
				const example = { id: crypto.randomUUID(), createdAt: Date.now() };

				const MemoneryApplication = define({
					...SAMPLE_OPTIONS,
					get: () => fetched ? null : example,
				});

				const application = await MemoneryApplication.get(ID_EXAMPLE);

				assert.equal(application.id, example.id);
				assert.equal(application.isDestroyed, false);
				fetched = true;
				await application.load();
				assert.equal(application.isDestroyed, true);
			});
		});

		describe('.destroy()', function () {
			it('should be destoryed.', async function () {
				let destroyed = false;
				const example = { id: crypto.randomUUID(), createdAt: Date.now() };

				const MemoneryApplication = define({
					...SAMPLE_OPTIONS,
					get: () => destroyed ? null : example,
					destroy: () => destroyed = true,
				});

				const application = await MemoneryApplication.get(ID_EXAMPLE);

				assert.equal(application.isDestroyed, false);
				await application.destroy();
				assert.equal(application.isDestroyed, true);
			});
		});

		describe('.id', function () {
			it('should get id.', async function () {
				const example = { id: crypto.randomUUID(), createdAt: Date.now() };

				const MemoneryApplication = define({
					...SAMPLE_OPTIONS,
					get: () => example,
				});

				const application = await MemoneryApplication.get(ID_EXAMPLE);

				assert.equal(application.id, example.id);
			});
		});

		describe('.createdAt', function () {
			it('should get a date.', async function () {
				const example = { id: crypto.randomUUID(), createdAt: Date.now() };

				const MemoneryApplication = define({
					...SAMPLE_OPTIONS,
					get: () => example,
				});

				const application = await MemoneryApplication.get(ID_EXAMPLE);

				assert.ok(application.createdAt instanceof Date);
			});
		});

		describe('.toJSON()', function () {
			it('should get a json string.', async function () {
				const example = { id: crypto.randomUUID(), createdAt: Date.now() };

				const MemoneryApplication = define({
					...SAMPLE_OPTIONS,
					get: () => example,
				});

				const application = await MemoneryApplication.get(ID_EXAMPLE);
				const jsonObject = JSON.parse(JSON.stringify(application));

				assert.equal(jsonObject.id, example.id);
				assert.equal(new Date(jsonObject.createdAt).getTime(), example.createdAt);
			});
		});
	});
});
