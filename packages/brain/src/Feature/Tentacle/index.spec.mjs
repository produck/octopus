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

		describe('.toJSON()', function () {
			it('should get a json object.', async function () {
				const TestTentacle = defineTentacle({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE }),
				});

				const tentacle = await TestTentacle.get(EXAMPLE.id);
				const jsonObject = JSON.parse(JSON.stringify(tentacle));

				assert.deepEqual(jsonObject, {
					...EXAMPLE,
					ready: false,
					createdAt: new Date(EXAMPLE.createdAt).toISOString(),
					visitedAt: new Date(EXAMPLE.visitedAt).toISOString(),
				});
			});
		});

		describe('.visit()', function () {
			it('should update visitedAt.', async function () {
				const TestTentacle = defineTentacle({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE }),
				});

				const tentacle = await TestTentacle.get(EXAMPLE.id);

				tentacle.visit();
				assert.notEqual(tentacle.visitedAt, EXAMPLE.visitedAt);
			});
		});

		describe('.pick()', function () {
			it('should set a job id.', async function () {
				const TestTentacle = defineTentacle({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE }),
				});

				const jobId = crypto.randomUUID();
				const tentacle = await TestTentacle.get(EXAMPLE.id);

				tentacle.pick(jobId);
				assert.equal(tentacle.toJSON().job, jobId);
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
				assert.equal(tentacle.toJSON().job, jobId);
				tentacle.free();
				assert.equal(tentacle.toJSON().job, null);
			});
		});
	});
});
