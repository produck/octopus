import { webcrypto as crypto } from 'node:crypto';
import * as assert from 'node:assert/strict';
import { describe, it } from 'mocha';

import { defineTentacle, Data } from './index.mjs';

describe('::Feature::Tentacle', function () {
	describe('::defineTentacle()', function () {
		const CustomTentacle = defineTentacle();

		assert.equal(CustomTentacle.name, 'CustomTentacleProxy');
	});

	describe('::TestTentacle', function () {
		const SAMPLE_OPTIONS = { name: 'Test' };

		const EXAMPLE = Data.normalize({
			id: crypto.randomUUID(),
			craft: 'mock',
			createdAt: Date.now(),
			visitedAt: Date.now(),
		});

		describe('::has()', function () {
			for (const value of [true, false]) {
				it(`should get ${value}.`, async function () {
					const TestTentacle = defineTentacle({
						...SAMPLE_OPTIONS,
						has: () => value,
					});

					assert.equal(await TestTentacle.has(EXAMPLE.id), value);
				});
			}
		});

		describe('::get()', function () {
			it('should get a tentacle.', async function () {
				const TestTentacle = defineTentacle({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE }),
				});

				const tentacle = await TestTentacle.get(EXAMPLE.id);

				assert.equal(tentacle.id, EXAMPLE.id);
			});
		});

		describe('::query()', function () {
			it('should get a [Tentacle]', async function () {
				const TestTentacle = defineTentacle({
					...SAMPLE_OPTIONS,
					query: { All: () => [{ ...EXAMPLE }] },
				});

				const tentacles = await TestTentacle.query({ name: 'All' });

				assert.equal(tentacles.length, 1);
			});
		});

		describe('::create()', function () {
			it('should create a new tentacle.', async function () {
				const TestTentacle = defineTentacle({
					...SAMPLE_OPTIONS,
					create: () => ({ ...EXAMPLE }),
				});

				const tentacle = await TestTentacle.create({ ...EXAMPLE });

				assert.equal(tentacle.id, EXAMPLE.id);
			});
		});

		describe('::fetch()', function () {
			it('should get to fetch a tentacle.', async function () {
				const id = crypto.randomUUID();

				const TestTentacle = defineTentacle({
					...SAMPLE_OPTIONS,
					has: () => true,
					get: () => ({ ...EXAMPLE }),
				});

				const tentacle = await TestTentacle.fetch({ id });

				assert.equal(tentacle.id, EXAMPLE.id);
			});

			it('should create to fetch a tentacle.', async function () {
				const id = crypto.randomUUID();

				const TestTentacle = defineTentacle({
					...SAMPLE_OPTIONS,
					create: () => ({ ...EXAMPLE }),
				});

				const tentacle = await TestTentacle.fetch({ id });

				assert.equal(tentacle.id, EXAMPLE.id);
			});
		});

		describe('.load()', function () {
			it('should update the tentacle.', async function () {
				const example = { ...EXAMPLE };

				const TestTentacle = defineTentacle({
					...SAMPLE_OPTIONS,
					get: () => ({ ...example }),
				});

				const tentacle = await TestTentacle.get(EXAMPLE.id);

				example.visitedAt += 5000;
				assert.equal(tentacle.visitedAt.getTime(), EXAMPLE.visitedAt);
				await tentacle.load();
				assert.equal(tentacle.visitedAt.getTime(), EXAMPLE.visitedAt + 5000);
			});
		});

		describe('.save()', function () {
			it('should save a tentacle.', async function () {
				const example = { ...EXAMPLE };

				const TestTentacle = defineTentacle({
					...SAMPLE_OPTIONS,
					get: () => ({ ...example }),
				});

				const tentacle = await TestTentacle.get(EXAMPLE.id);

				await tentacle.save();
			});
		});

		describe('.destroy()', function () {
			it('should destroy the tentacle.', async function () {
				const example = { ...EXAMPLE };

				const TestTentacle = defineTentacle({
					...SAMPLE_OPTIONS,
					get: () => ({ ...example }),
				});

				const tentacle = await TestTentacle.get(EXAMPLE.id);

				await tentacle.destroy();
				assert.equal(tentacle.isDestroyed, true);
			});
		});

		for (const key of ['createdAt', 'visitedAt']) {
			describe(`.${key}`, function () {
				it('should get Date', async function () {
					const example = { ...EXAMPLE };

					const TestTentacle = defineTentacle({
						...SAMPLE_OPTIONS,
						get: () => ({ ...example }),
					});

					const product = await TestTentacle.get(EXAMPLE.id);

					assert.ok(product[key] instanceof Date);
				});
			});
		}

		describe('.pick()', function () {
			it('should set a job id.', async function () {
				const TestTentacle = defineTentacle({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE }),
				});

				const jobId = crypto.randomUUID();
				const tentacle = await TestTentacle.get(EXAMPLE.id);

				tentacle.pick(jobId);
				assert.equal(tentacle.job, jobId);
			});
		});

		describe('.free()', function () {
			it('should set job null.', async function () {
				const TestTentacle = defineTentacle({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE }),
				});

				const jobId = crypto.randomUUID();
				const tentacle = await TestTentacle.get(EXAMPLE.id);

				tentacle.pick(jobId);
				assert.equal(tentacle.job, jobId);
				tentacle.free();
				assert.equal(tentacle.job, null);
			});
		});

		describe('.setReady()', function () {
			it('should set tentacle ready.', async function () {
				const TestTentacle = defineTentacle({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE }),
				});

				const tentacle = await TestTentacle.get(EXAMPLE.id);

				assert.equal(tentacle.ready, false);
				tentacle.setReady();
				assert.equal(tentacle.ready, true);
			});

			it('should throw if bad flag.', async function () {
				const TestTentacle = defineTentacle({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE }),
				});

				const tentacle = await TestTentacle.get(EXAMPLE.id);

				await assert.rejects(async () => await tentacle.setReady(1), {
					name: 'TypeError',
					message: 'Invalid "flag", one "boolean" expected.',
				});
			});
		});
	});
});
