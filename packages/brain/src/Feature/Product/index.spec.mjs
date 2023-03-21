import { webcrypto as crypto } from 'node:crypto';
import * as assert from 'node:assert/strict';
import { describe, it } from 'mocha';

import * as Procedure from '../Procedure/index.mjs';
import { Data, defineProduct, Options, STATUS } from './index.mjs';

const NativeProcedure = Procedure.define({
	create: data => data,
});

describe('::Feature::Product', function () {
	this.beforeAll(async () => {
		await NativeProcedure.register('example', {
			order: any => any !== null,
			artifact: any => any !== null,
			script: { *main() {} },
		});
	});

	describe('::defineProduct()', function () {
		it('should create a CustomProduct.', function () {
			const CustomProduct = defineProduct();

			assert.equal(CustomProduct.name, 'CustomProductProxy');
		});
	});

	describe('::TestProduct', function () {
		const SAMPLE_OPTIONS = Options.normalize({
			name: 'Test',
			Procedure: NativeProcedure,
		});

		const EXAMPLE = Data.normalize({
			id: crypto.randomUUID(),
			owner: crypto.randomUUID(),
			model: 'example',
			order: 1,
		});

		describe('::has()', function () {
			for (const value of [true, false]) {
				it(`should get ${value}.`, async function () {
					const TestProduct = defineProduct({
						...SAMPLE_OPTIONS,
						has: () => value,
					});

					assert.equal(await TestProduct.has(EXAMPLE.id), value);
				});
			}
		});

		describe('::get()', function () {
			it('should get a product.', async function () {
				const TestProduct = defineProduct({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE }),
				});

				const product = await TestProduct.get(EXAMPLE.id);

				assert.equal(product.id, EXAMPLE.id);
			});

			it('shoul throw if bad data.order.', async function () {
				const TestProduct = defineProduct({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE, order: null, orderedAt: Date.now() }),
				});

				await assert.rejects(async () => await TestProduct.get(EXAMPLE.id), {
					name: 'ProductImplementError',
					message: 'Bad Product data.',
				});
			});

			it('shoul throw if bad data.artifact.', async function () {
				const TestProduct = defineProduct({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE, artifact: null, status: STATUS.OK }),
				});

				await assert.rejects(async () => await TestProduct.get(EXAMPLE.id), {
					name: 'ProductImplementError',
					message: 'Bad Product data.',
				});
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

				const product = await TestProduct.get(EXAMPLE.id);

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
					save: data => data,
				});

				const product = await TestProduct.get(EXAMPLE.id);

				await product.save();
			});
		});

		describe('.destroy()', function () {
			it('should destroy the product', async function () {
				const TestProduct = defineProduct({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE }),
				});

				const product = await TestProduct.get(EXAMPLE.id);

				await product.destroy();
				assert.equal(product.isDestroyed, true);
			});
		});

		const ats = {};

		for (const key of ['createdAt', 'orderedAt', 'finishedAt']) {
			describe(`.${key}`, function () {
				it('should get null', async function () {
					const TestProduct = defineProduct({
						...SAMPLE_OPTIONS,
						get: () => ({ ...EXAMPLE }),
					});

					const product = await TestProduct.get(EXAMPLE.id);

					assert.equal(product[key], null);
				});

				it('should get Date', async function () {
					ats[key] = Date.now();

					const example = { ...EXAMPLE, ...ats };

					const TestProduct = defineProduct({
						...SAMPLE_OPTIONS,
						get: () => ({ ...example }),
					});

					const product = await TestProduct.get(EXAMPLE.id);

					assert.ok(product[key] instanceof Date);
				});
			});
		}

		describe('.setOrder()', function () {
			it('should update product.', async function () {
				const example = { ...EXAMPLE };

				const TestProduct = defineProduct({
					...SAMPLE_OPTIONS,
					get: () => ({ ...example }),
					save: data => Object.assign(example, data),
				});

				const product = await TestProduct.get(EXAMPLE.id);

				assert.equal(product.orderedAt, null);
				await product.setOrder();
				assert.notEqual(product.orderedAt, null);
			});

			it('should update product.', async function () {
				const example = { ...EXAMPLE };

				const TestProduct = defineProduct({
					...SAMPLE_OPTIONS,
					get: () => ({ ...example }),
					save: data => Object.assign(example, data),
				});

				const product = await TestProduct.get(EXAMPLE.id);

				assert.equal(product.orderedAt, null);
				await product.setOrder();

				await assert.rejects(async () => await product.setOrder(), {
					name: 'Error',
					message: 'This product has been ordered.',
				});
			});

			it('should throw if bad order', async function () {
				const example = { ...EXAMPLE };

				const TestProcedure = Procedure.define({
					create: data => data,
				});

				await TestProcedure.register('example', {
					script: { *main() {} },
					order: () => false,
				});

				const TestProduct = defineProduct({
					...SAMPLE_OPTIONS,
					get: () => ({ ...example }),
					save: data => Object.assign(example, data),
					Procedure: TestProcedure,
				});

				const product = await TestProduct.get(EXAMPLE.id);

				assert.equal(product.orderedAt, null);

				await assert.rejects(async () => await product.setOrder(null), {
					name: 'TypeError',
					message: 'Invalid "order", one "example order" expected.',
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

				const product = await TestProduct.get(EXAMPLE.id);

				assert.equal(product.finishedAt, null);
				await product.finish(0, 'ok').save();
				assert.equal(product.message, 'ok');
				assert.notEqual(product.finishedAt, null);
			});
		});

		describe('.complete()', function () {
			it('should update a product.', async function () {
				const example = { ...EXAMPLE, orderedAt: Date.now() };

				const TestProduct = defineProduct({
					...SAMPLE_OPTIONS,
					get: () => ({ ...example }),
					save: data => Object.assign(example, data),
				});

				const product = await TestProduct.get(EXAMPLE.id);

				assert.equal(product.finishedAt, null);
				await product.complete('ok').save();
				assert.equal(product.artifact, 'ok');
				assert.notEqual(product.finishedAt, null);
			});

			it('should throw if bad artifact.', async function () {
				const example = { ...EXAMPLE, orderedAt: Date.now() };

				const TestProduct = defineProduct({
					...SAMPLE_OPTIONS,
					get: () => ({ ...example }),
					save: data => Object.assign(example, data),
				});

				const product = await TestProduct.get(EXAMPLE.id);

				assert.throws(() => product.complete(null), {
					name: 'TypeError',
					message: 'Invalid "artifact", one "example artifact" expected.',
				});
			});
		});
	});
});
