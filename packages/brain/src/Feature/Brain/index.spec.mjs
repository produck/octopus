import { webcrypto as crypto } from 'node:crypto';
import * as assert from 'node:assert/strict';
import { describe, it } from 'mocha';

import { defineBrain } from './index.mjs';
import * as Data from './Data.mjs';

describe('Feature::Brain', function () {
	describe('::defineBrain()', function () {
		it('should create a CustomBrain.', function () {
			const CustomBrain = defineBrain();

			assert.equal(CustomBrain.name, 'CustomBrainProxy');
		});
	});

	describe('::TestBrain', function () {
		const SAMPLE_OPTIONS = { name: 'Test' };

		const EXAMPLE = Data.normalize({
			id: crypto.randomUUID(),
			name: 'Example',
			version: '0.0.0',
		});

		describe('::has()', async function () {
			for (const value of [true, false]) {
				it(`should get ${value}.`, async function () {
					const TestBrain = defineBrain({
						...SAMPLE_OPTIONS,
						has: () => value,
					});

					assert.equal(await TestBrain.has(EXAMPLE.id), value);
				});
			}
		});

		describe('::get()', function () {
			it('should get a brain.', async function () {
				const TestBrain = defineBrain({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE }),
				});

				const brain = await TestBrain.get(EXAMPLE.id);

				assert.equal(brain.id, EXAMPLE.id);
			});
		});

		describe('::query()', function () {
			it('should get a [Brain].', async function () {
				const TestBrain = defineBrain({
					...SAMPLE_OPTIONS,
					query: { All: () => [{ ...EXAMPLE }] },
				});

				const brains = await TestBrain.query();

				assert.equal(brains.length, 1);
			});
		});

		describe('::on()', function () {
			it('should be able to on().', function () {
				const TestBrain = defineBrain({ ...SAMPLE_OPTIONS });

				assert.equal(TestBrain.on('abc', () => {}), TestBrain);
			});

			it('should emit "grant" event.', async function () {
				const ats = { createdAt: Date.now(), visitedAt: Date.now() };
				const a = { ...EXAMPLE, ...ats, id: '2221a190-0eb5-48a9-bc0e-a62a26ed78cb' };
				const b = { ...EXAMPLE, ...ats, id: 'aabc4bdc-18dc-49b0-9b66-7be2cede3545' };

				const EXTERNAL = {
					MAX_ALIVE_GAP: 5000,
					WATCHING_INTERVAL: 10,
				};

				const TestBrain = defineBrain({
					...SAMPLE_OPTIONS,
					has: () => true,
					get: () => ({ ...a }),
					query: { All: () => [a, b] },
					external: key => EXTERNAL[key],
				});

				const granted = new Promise(resolve => {
					TestBrain.on('grant', function () {
						assert.equal(TestBrain.current.id, a.id);
						TestBrain.halt();
						resolve();
					});
				});

				await TestBrain.boot({ ...a });
				await granted;
			});

			it('should emit "watch-error" event.', async function () {
				const TestBrain = defineBrain({ ...SAMPLE_OPTIONS });

				const catching = new Promise(resolve => {
					TestBrain.on('watch-error', function (error) {
						assert.equal(error.message, 'There SHOULD be 1 brain at least.');
						TestBrain.halt();
						resolve();
					});
				});

				await TestBrain.boot({ ...EXAMPLE });
				await catching;
			});
		});

		describe('::off()', function () {
			it('should be able to on().', function () {
				const TestBrain = defineBrain({ ...SAMPLE_OPTIONS });

				assert.equal(TestBrain.off('abc', () => {}), TestBrain);
			});
		});

		describe('::once()', function () {
			it('should be able to on().', function () {
				const TestBrain = defineBrain({ ...SAMPLE_OPTIONS });

				assert.equal(TestBrain.once('abc', () => {}), TestBrain);
			});
		});

		describe('::boot()', function () {
			it('should start watch.', async function () {
				const TestBrain = defineBrain({ ...SAMPLE_OPTIONS });

				await TestBrain.boot({ ...EXAMPLE });
				assert.equal(TestBrain.isActive, true);
				TestBrain.halt();
			});

			it('should throw if has been booted.', async function () {
				const TestBrain = defineBrain({ ...SAMPLE_OPTIONS });

				await TestBrain.boot({ ...EXAMPLE });
				assert.equal(TestBrain.isActive, true);

				await assert.rejects(async () => await TestBrain.boot(), {
					name: 'Error',
					message: 'A brain is alive currently.',
				});

				TestBrain.halt();
			});
		});

		describe('::halt()', function () {
			it('should stop watching.', async function () {
				const TestBrain = defineBrain({ ...SAMPLE_OPTIONS });

				await TestBrain.boot({ ...EXAMPLE });
				assert.equal(TestBrain.isActive, true);
				TestBrain.halt();
				assert.equal(TestBrain.isActive, false);
			});
		});

		describe('::WATCHING_INTERVAL', function () {
			it('should be 0.', function () {
				const TestBrain = defineBrain({ ...SAMPLE_OPTIONS });

				assert.equal(TestBrain.WATCHING_INTERVAL, 0);
			});
		});

		describe('::MAX_ALIVE_GAP', function () {
			it('should be 0.', function () {
				const TestBrain = defineBrain({ ...SAMPLE_OPTIONS });

				assert.equal(TestBrain.MAX_ALIVE_GAP, 0);
			});
		});

		describe('::isActive', function () {
			it('should be false.', function () {
				const TestBrain = defineBrain({ ...SAMPLE_OPTIONS });

				assert.equal(TestBrain.isActive, false);
			});

			it('should be true.', async function () {
				const TestBrain = defineBrain({ ...SAMPLE_OPTIONS });

				await TestBrain.boot({ ...EXAMPLE });
				assert.equal(TestBrain.isActive, true);
				TestBrain.halt();
			});
		});

		describe('::current', function () {
			it('should be null.', function () {
				const TestBrain = defineBrain({ ...SAMPLE_OPTIONS });

				assert.equal(TestBrain.current, null);
			});

			it('should not be null.', async function () {
				const TestBrain = defineBrain({ ...SAMPLE_OPTIONS });

				await TestBrain.boot({ ...EXAMPLE });
				assert.ok(TestBrain.current instanceof TestBrain);
				TestBrain.halt();
			});
		});

		for (const key of ['createdAt', 'visitedAt']) {
			describe(`.${key}`, function () {
				it('should get Date', async function () {
					const example = {
						...EXAMPLE,
						createdAt: Date.now(),
						visitedAt: Date.now(),
					};

					const TestBrain = defineBrain({
						...SAMPLE_OPTIONS,
						get: () => ({ ...example }),
					});

					const product = await TestBrain.get(EXAMPLE.id);

					assert.ok(product[key] instanceof Date);
				});
			});
		}

		describe('.load()', function () {
			it('should update a brain.', async function () {
				const TestBrain = defineBrain({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE }),
				});

				const brain = await TestBrain.get(EXAMPLE.id);

				await brain.load();
			});
		});

		describe('.toJSON()', function () {
			it('should get a json object.', async function () {
				const TestBrain = defineBrain({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE }),
				});

				const brain = await TestBrain.get(EXAMPLE.id);
				const jsonObject = JSON.parse(JSON.stringify(brain));

				assert.deepEqual(jsonObject, {
					...EXAMPLE,
					createdAt: new Date(EXAMPLE.createdAt).toISOString(),
					visitedAt: new Date(EXAMPLE.visitedAt).toISOString(),
				});
			});
		});
	});
});
