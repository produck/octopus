import { webcrypto as crypto } from 'node:crypto';
import * as assert from 'node:assert/strict';
import { describe, it } from 'mocha';

import * as Craft from '../Craft/index.mjs';
import { defineJob, Options, STATUS, Data } from './index.mjs';

const NativeCraft = Craft.define({
	create: data => data,
});

describe('::Feature::Job', function () {
	this.beforeAll(async () => {
		await NativeCraft.register('example', {
			source: any => any !== null,
			target: any => any !== null,
		});
	});

	describe('::defineJob()', function () {
		it('should create a CustomJob.', function () {
			const CustomJob = defineJob();

			assert.equal(CustomJob.name, 'CustomJobProxy');
		});
	});

	describe('::TestJob', function () {
		const SAMPLE_OPTIONS = Options.normalize({
			name: 'Test',
			Craft: NativeCraft,
		});

		const EXAMPLE = Data.normalize({
			id: crypto.randomUUID(),
			product: crypto.randomUUID(),
			craft: 'example',
			source: true,
			target: true,
		});

		describe('::has()', function () {
			it('should get false.', async function () {
				const TestJob = defineJob({
					...SAMPLE_OPTIONS,
					has: () => true,
				});

				assert.equal(await TestJob.has(EXAMPLE.id), true);
			});

			it('should get false.', async function () {
				const TestJob = defineJob({
					...SAMPLE_OPTIONS,
					has: () => false,
				});

				assert.equal(await TestJob.has(EXAMPLE.id), false);
			});
		});

		describe('::get()', function () {
			it('should get a job.', async function () {
				const TestJob = defineJob({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE }),
				});

				const job = await TestJob.get(EXAMPLE.id);

				assert.equal(job.id, EXAMPLE.id);
			});

			it('should throw if bad job.source.', async function () {
				const TestJob = defineJob({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE, source: null }),
				});

				await assert.rejects(async () => await TestJob.get(EXAMPLE.id), {
					name: 'JobImplementError',
					message: 'Bad Job data.',
				});
			});

			it('should throw if bad job.target.', async function () {
				const TestJob = defineJob({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE, target: null, status: STATUS.OK }),
				});

				await assert.rejects(async () => await TestJob.get(EXAMPLE.id), {
					name: 'JobImplementError',
					message: 'Bad Job data.',
				});
			});
		});

		describe('::query()', function () {
			it('should get a [Job]', async function () {
				const TestJob = defineJob({
					...SAMPLE_OPTIONS,
					query: {
						All: () => [{ ...EXAMPLE }],
					},
				});

				const jobs = await TestJob.query({ name: 'All' });

				assert.equal(jobs.length, 1);
			});
		});

		describe('::create()', function () {
			it('should get a new Job.', async function () {
				const TestJob = defineJob({
					...SAMPLE_OPTIONS,
					create: () => ({ ...EXAMPLE }),
				});

				const job = await TestJob.create(EXAMPLE);

				assert.equal(job.id, EXAMPLE.id);
			});
		});

		describe('.load()', function () {
			it('should update the job.', async function () {
				const example = { ...EXAMPLE };
				const newId = crypto.randomUUID();

				assert.notEqual(example.id, newId);

				const TestJob = defineJob({
					...SAMPLE_OPTIONS,
					get: () => ({ ...example }),
				});

				const job = await TestJob.get(EXAMPLE.id);

				assert.equal(job.id, EXAMPLE.id);
				example.id = newId;
				await job.load();
				assert.equal(job.id, newId);
			});
		});

		describe('.save()', function () {
			it('should save a job.', async function () {
				const TestJob = defineJob({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE }),
					save: () => ({ ...EXAMPLE }),
				});

				const job = await TestJob.get(EXAMPLE.id);

				await job.save();
			});
		});

		describe('.destroy()', async function () {
			it('should be destroyed.', async function () {
				const TestJob = defineJob({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE }),
				});

				const job = await TestJob.get(EXAMPLE.id);

				await job.destroy();
			});
		});

		const ats = {};

		for (const key of [
			'visited', 'created', 'assigned', 'started', 'finished',
		].map(atKey => `${atKey}At`)) {
			describe(`.${key}`, function () {
				it('should get null', async function () {
					const TestJob = defineJob({
						...SAMPLE_OPTIONS,
						get: () => ({ ...EXAMPLE }),
					});

					const job = await TestJob.get(EXAMPLE.id);

					assert.equal(job[key], null);
				});

				it('should get Date', async function () {
					ats[key] = Date.now();

					const example = { ...EXAMPLE, ...ats };

					const TestJob = defineJob({
						...SAMPLE_OPTIONS,
						get: () => ({ ...example }),
					});

					const job = await TestJob.get(EXAMPLE.id);

					assert.ok(job[key] instanceof Date);
				});
			});
		}

		describe('.toJSON()', function () {
			it('should get a json string.', async function () {
				const now = Date.now();
				const example = { ...EXAMPLE, createdAt: now };

				const TestJob = defineJob({
					...SAMPLE_OPTIONS,
					get: () => ({ ...example }),
				});

				const job = await TestJob.get(example.id);
				const jsonObject = JSON.parse(JSON.stringify(job));

				assert.deepEqual(jsonObject, {
					...EXAMPLE,
					createdAt: new Date(now).toISOString(),
				});
			});
		});

		describe('.visit()', function () {
			it('should update job.', async function () {
				const example = { ...EXAMPLE };

				const TestJob = defineJob({
					...SAMPLE_OPTIONS,
					get: () => ({ ...example }),
					save: data => Object.assign(example, data),
				});

				const job = await TestJob.get(example.id);

				assert.equal(example.visitedAt, null);
				await job.visit().save();
				assert.notEqual(example.visitedAt, null);
			});
		});

		describe('.assign()', function () {
			it('should update job', async function () {
				const example = { ...EXAMPLE };

				const TestJob = defineJob({
					...SAMPLE_OPTIONS,
					get: () => ({ ...example }),
					save: data => Object.assign(example, data),
				});

				const job = await TestJob.get(example.id);

				assert.equal(example.assignedAt, null);
				await job.assign().save();
				assert.notEqual(example.assignedAt, null);
			});

			it('should throw if has been assigned.', async function () {
				const example = { ...EXAMPLE };

				const TestJob = defineJob({
					...SAMPLE_OPTIONS,
					get: () => ({ ...example }),
					save: data => Object.assign(example, data),
				});

				const job = await TestJob.get(example.id);

				await job.assign();

				await assert.rejects(async () => await job.assign(), {
					name: 'Error',
					message: 'This job has been assigned.',
				});
			});
		});

		describe('.start()', function () {
			it('should update job', async function () {
				const example = { ...EXAMPLE, assignedAt: Date.now() };

				const TestJob = defineJob({
					...SAMPLE_OPTIONS,
					get: () => ({ ...example }),
					save: data => Object.assign(example, data),
				});

				const job = await TestJob.get(example.id);

				assert.equal(example.startedAt, null);
				await job.start().save();
				assert.notEqual(example.startedAt, null);
			});

			it('should throw if has not been assigned.', async function () {
				const example = { ...EXAMPLE };

				const TestJob = defineJob({
					...SAMPLE_OPTIONS,
					get: () => ({ ...example }),
					save: data => Object.assign(example, data),
				});

				const job = await TestJob.get(example.id);

				await assert.rejects(async () => await job.start(), {
					name: 'Error',
					message: 'This job is NOT assigned.',
				});
			});

			it('should throw if has been started.', async function () {
				const example = { ...EXAMPLE, assignedAt: Date.now() };

				const TestJob = defineJob({
					...SAMPLE_OPTIONS,
					get: () => ({ ...example }),
					save: data => Object.assign(example, data),
				});

				const job = await TestJob.get(example.id);

				await job.start();

				await assert.rejects(async () => await job.start(), {
					name: 'Error',
					message: 'This job has been started.',
				});
			});
		});

		describe('.finish()', function () {
			it('should update job.', async function () {
				const example = { ...EXAMPLE, createdAt: Date.now() };

				const TestJob = defineJob({
					...SAMPLE_OPTIONS,
					get: () => ({ ...example }),
					save: data => Object.assign(example, data),
				});

				const job = await TestJob.get(example.id);

				await job.finish(0, 'ok').save();
				assert.equal(example.message, 'ok');
				assert.notEqual(example.finishedAt, null);
			});
		});

		describe('.complete()', function () {
			it('should update job.', async function () {
				const example = { ...EXAMPLE, createdAt: Date.now() };

				const TestJob = defineJob({
					...SAMPLE_OPTIONS,
					get: () => ({ ...example }),
					save: data => Object.assign(example, data),
				});

				const job = await TestJob.get(example.id);

				await job.complete({}).save();
				assert.equal(example.status, STATUS.OK);
				assert.deepEqual(example.target, {});
				assert.notEqual(example.finishedAt, null);
			});

			it('should throw if bad target.', async function () {
				const example = {
					...EXAMPLE,
					createdAt: Date.now(),
				};

				const TestJob = defineJob({
					...SAMPLE_OPTIONS,
					get: () => ({ ...example }),
					save: data => Object.assign(example, data),
				});

				const job = await TestJob.get(example.id);

				assert.throws(() => job.complete(null), {
					name: 'TypeError',
					message: 'Invalid "target", one "example target" expected.',
				});
			});
		});
	});
});
