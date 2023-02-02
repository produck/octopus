import { webcrypto as crypto } from 'node:crypto';
import * as assert from 'node:assert';
import { describe, it } from 'mocha';

import { Data, defineProduct } from './index.mjs';

describe('::Feature::Product', function () {
	describe('::defineProduct()', function () {
		it('should create a CustomProduct.', function () {
			const CustomProduct = defineProduct();

			assert.equal(CustomProduct.name, 'CustomProductProxy');
		});
	});

	describe('::TestProduct', function () {
		const SAMPLE_OPTIONS = { name: 'Test' };

		const EXAMPLE = Data.normalize({
			id: crypto.randomUUID(),
			owner: crypto.randomUUID(),
		});

		describe('::has()', function () {
			for (const value of [true, false]) {
				it(`should get ${value}.`, async function () {
					const TestProduct = defineProduct({
						...SAMPLE_OPTIONS,
						has: () => value,
					});

					assert.equal(await TestProduct.has(EXAMPLE), value);
				});
			}
		});

		describe('::get()', function () {
			it('should get a product.', async function () {
				const TestProduct = defineProduct({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE }),
				});

				const product = await TestProduct.get({
					id: EXAMPLE.id,
					owner: EXAMPLE.owner,
				});

				assert.equal(product.id, EXAMPLE.id);
			});
		});

		describe('::query()', function () {
			it('should get a [Product]', async function () {
				const TestProduct = defineProduct({
					...SAMPLE_OPTIONS,
					query: { All: () => [{ ...EXAMPLE }] },
				});

				const products = await TestProduct.query({ name: 'All' });

				assert.equal(products.length, 1);
			});
		});

		describe('::create', function () {
			it('should create a new product.', async function () {
				const TestProduct = defineProduct({
					...SAMPLE_OPTIONS,
					create: () => ({ ...EXAMPLE }),
				});

				const product = await TestProduct.create({ ...EXAMPLE });

				assert.equal(product.id, EXAMPLE.id);
			});
		});

		describe('.load()', function () {
			it('should update the product.', async function () {
				const example = { ...EXAMPLE };
				const newId = crypto.randomUUID();

				assert.notEqual(example.id, newId);

				const TestProduct = defineProduct({
					...SAMPLE_OPTIONS,
					get: () => ({ ...example }),
				});

				const product = await TestProduct.get({
					id: EXAMPLE.id,
					owner: EXAMPLE.owner,
				});

				assert.equal(product.id, EXAMPLE.id);
				example.id = newId;
				await product.load();
				assert.equal(product.id, newId);
			});
		});

		describe('.save()', function () {
			it('should save a product.', async function () {
				const TestProduct = defineProduct({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE }),
				});

				const product = await TestProduct.get({
					id: EXAMPLE.id,
					owner: EXAMPLE.owner,
				});

				await product.save();
			});
		});

		describe('.destroy()', function () {
			it('should destroy the product', async function () {
				const TestProduct = defineProduct({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE }),
				});

				const product = await TestProduct.get({
					id: EXAMPLE.id,
					owner: EXAMPLE.owner,
				});

				await product.destroy();
				assert.equal(product.isDestroyed, true);
			});
		});

		const ats = {};

		for (const key of ['createdAt', 'orderedAt', 'startedAt', 'finishedAt']) {
			describe(`.${key}`, function () {
				it('should get null', async function () {
					const TestProduct = defineProduct({
						...SAMPLE_OPTIONS,
						get: () => ({ ...EXAMPLE }),
					});

					const product = await TestProduct.get(EXAMPLE);

					assert.equal(product[key], null);
				});

				it('should get Date', async function () {
					ats[key] = Date.now();

					const example = { ...EXAMPLE, ...ats };

					const TestProduct = defineProduct({
						...SAMPLE_OPTIONS,
						get: () => ({ ...example }),
					});

					const product = await TestProduct.get(EXAMPLE);

					assert.ok(product[key] instanceof Date);
				});
			});
		}

		describe('.toJSON()', function () {
			it('should get a json string.', async function () {
				const now = Date.now();
				const example = { ...EXAMPLE, createdAt: now };

				const TestProduct = defineProduct({
					...SAMPLE_OPTIONS,
					get: () => ({ ...example }),
				});

				const job = await TestProduct.get(example);
				const jsonObject = JSON.parse(JSON.stringify(job));

				assert.deepEqual(jsonObject, {
					...EXAMPLE,
					createdAt: new Date(now).toISOString(),
				});
			});
		});

		describe('.order()', function () {
			it('should update product.', async function () {
				const example = { ...EXAMPLE };

				const TestProduct = defineProduct({
					...SAMPLE_OPTIONS,
					get: () => ({ ...example }),
					save: data => Object.assign(example, data),
				});

				const product = await TestProduct.get(example);

				assert.equal(product.orderedAt, null);
				await product.order();
				assert.notEqual(product.orderedAt, null);
			});

			it('should update product.', async function () {
				const example = { ...EXAMPLE };

				const TestProduct = defineProduct({
					...SAMPLE_OPTIONS,
					get: () => ({ ...example }),
					save: data => Object.assign(example, data),
				});

				const product = await TestProduct.get(example);

				assert.equal(product.orderedAt, null);
				await product.order();

				await assert.rejects(async () => await product.order(), {
					name: 'Error',
					message: 'This product has been ordered.',
				});
			});
		});

		describe('.start()', function () {
			it('should update product.', async function () {
				const example = { ...EXAMPLE, orderedAt: Date.now() };

				const TestProduct = defineProduct({
					...SAMPLE_OPTIONS,
					get: () => ({ ...example }),
					save: data => Object.assign(example, data),
				});

				const product = await TestProduct.get(example);

				assert.equal(product.startedAt, null);
				await product.start();
				assert.notEqual(product.startedAt, null);
			});

			it('should throw if has not been ordered.', async function () {
				const example = { ...EXAMPLE };

				const TestProduct = defineProduct({
					...SAMPLE_OPTIONS,
					get: () => ({ ...example }),
					save: data => Object.assign(example, data),
				});

				const product = await TestProduct.get(example);

				assert.equal(product.startedAt, null);

				await assert.rejects(async () => await product.start(), {
					name: 'Error',
					message: 'This product is NOT ordered.',
				});
			});

			it('should throw if has been started.', async function () {
				const example = { ...EXAMPLE, orderedAt: Date.now() };

				const TestProduct = defineProduct({
					...SAMPLE_OPTIONS,
					get: () => ({ ...example }),
					save: data => Object.assign(example, data),
				});

				const product = await TestProduct.get(example);

				assert.equal(product.startedAt, null);
				await product.start();

				await assert.rejects(async () => await product.start(), {
					name: 'Error',
					message: 'This product has been started.',
				});
			});
		});

		describe('.finish()', function () {
			it('should update product.', async function () {
				const example = { ...EXAMPLE, orderedAt: Date.now() };

				const TestProduct = defineProduct({
					...SAMPLE_OPTIONS,
					get: () => ({ ...example }),
					save: data => Object.assign(example, data),
				});

				const product = await TestProduct.get(example);

				assert.equal(product.finishedAt, null);
				await product.finish(0, 'ok');
				assert.equal(product.message, 'ok');
				assert.notEqual(product.finishedAt, null);
			});
		});
	});
});
