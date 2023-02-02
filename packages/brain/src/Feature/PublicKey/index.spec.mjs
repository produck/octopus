import * as assert from 'node:assert/strict';
import { describe, it } from 'mocha';

import { webcrypto as crypto, generateKeyPairSync, createSign } from 'node:crypto';
import { define } from './index.mjs';
import { _ } from '@produck/shop';

const { publicKey, privateKey } = generateKeyPairSync('rsa', {
	modulusLength: 4096,
});

describe('::Feature::PublicKey', function () {
	describe('::define()', function () {
		it('should create a CustomPublicKey.', function () {
			const CustomPublicKey = define();

			assert.equal(CustomPublicKey.name, 'CustomPublicKeyProxy');
		});
	});

	describe('::TestPublicKey', function () {
		const SAMPLE_OPTIONS = { name: 'Test' };

		const EXAMPLE = {
			id: crypto.randomUUID(),
			owner: crypto.randomUUID(),
			pem: publicKey.export({ format: 'pem', type: 'spki' }),
			createdAt: Date.now(),
		};

		describe('::has()', function () {
			it('should get true.', async function () {
				const TestPublicKey = define({
					...SAMPLE_OPTIONS,
					has: () => true,
				});

				assert.equal(await TestPublicKey.has({}), true);
			});

			it('should get false.', async function () {
				const TestPublicKey = define({
					...SAMPLE_OPTIONS,
					has: () => false,
				});

				assert.equal(await TestPublicKey.has({}), false);
			});
		});

		describe('::get()', function () {
			it('should get a key.', async function () {
				const TestPublicKey = define({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE }),
				});

				const key = await TestPublicKey.get({ ...EXAMPLE });

				assert.equal(key.id, EXAMPLE.id);
			});
		});

		describe('::query()', function () {
			it('should get a key[].', async function () {
				const TestPublicKey = define({ ...SAMPLE_OPTIONS });
				const keys = await TestPublicKey.query();

				assert.deepEqual(keys, []);
			});

			it('should get a [PublicKey].', async function () {
				const TestPublicKey = define({
					...SAMPLE_OPTIONS,
					query: {
						All: () => [{ ...EXAMPLE }],
					},
				});

				const keys = await TestPublicKey.query({ name: 'All' });

				assert.equal(keys.length, 1);
			});

			it('should throw if bad filter.', async function () {
				const TestPublicKey = define({ ...SAMPLE_OPTIONS });

				await assert.rejects(async () => {
					await TestPublicKey.query({ name: 1 });
				}, {
					name: 'TypeError',
					message: 'Invalid ".name", one "value in "All", "OfOwner"" expected.',
				});
			});
		});

		describe('::create()', function () {
			it('should create a key.', async function () {
				const store = [];

				const TestPublicKey = define({
					...SAMPLE_OPTIONS,
					create: (data) => {
						store.push(data);

						return { ...EXAMPLE };
					},
				});

				await TestPublicKey.create({ ...EXAMPLE });

				assert.equal(store.length, 1);
			});
		});

		describe('.load()', function () {
			it('should load a new data.', async function () {
				const example = { ...EXAMPLE };
				const newCreatedAt = Date.now() + 5000;

				const TestPublicKey = define({
					...SAMPLE_OPTIONS,
					get: () => ({ ...example }),
				});

				const key = await TestPublicKey.get(EXAMPLE);

				assert.equal(_(key).createdAt, EXAMPLE.createdAt);
				example.createdAt = newCreatedAt;
				await key.load();
				assert.equal(_(key).createdAt, newCreatedAt);
			});
		});

		describe('.destroy()', function () {
			it('should be destroyed.', async function () {
				const TestPublicKey = define({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE }),
				});

				const key = await TestPublicKey.get(EXAMPLE);

				assert.equal(key.isDestroyed, false);
				await key.destroy();
				assert.equal(key.isDestroyed, true);
			});
		});

		describe('.verify()', function () {
			it('should be false.', async function () {
				const TestPublicKey = define({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE }),
				});

				const key = await TestPublicKey.get(EXAMPLE);

				assert.equal(await key.verify('', '1'), false);
			});

			it('should be false if bad pem.', async function () {
				const TestPublicKey = define({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE, pem: '' }),
				});

				const key = await TestPublicKey.get(EXAMPLE);

				assert.equal(await key.verify('', '1'), false);
			});

			it('should be true.', async function () {
				const plain = 'foo';
				const sign = createSign('SHA256');

				sign.update(plain);
				sign.end();

				const signature = sign.sign(privateKey);

				const TestPublicKey = define({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE }),
				});

				const key = await TestPublicKey.get(EXAMPLE);

				assert.equal(await key.verify(plain, signature.toString('hex')), true);
			});

			it('should throw if bad plain.', async function () {
				const TestPublicKey = define({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE }),
				});

				const key = await TestPublicKey.get(EXAMPLE);

				assert.throws(() => key.verify(1), {
					name: 'TypeError',
					message: 'Invalid "plain", one "string" expected.',
				});
			});

			it('should throw if bad signature.', async function () {
				const TestPublicKey = define({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE }),
				});

				const key = await TestPublicKey.get(EXAMPLE);

				assert.throws(() => key.verify('', 1), {
					name: 'TypeError',
					message: 'Invalid "signature", one "hex string" expected.',
				});
			});
		});

		describe('.toJSON()', function () {
			it('should get a json string.', async function () {
				const TestPublicKey = define({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE }),
				});

				const key = await TestPublicKey.get(EXAMPLE);
				const jsonObject = JSON.parse(JSON.stringify(key));

				assert.deepEqual(jsonObject, {
					id: EXAMPLE.id,
					owner: EXAMPLE.owner,
					createdAt: new Date(EXAMPLE.createdAt).toISOString(),
				});
			});
		});

		describe('.id', function () {
			it('should get id.', async function () {
				const TestPublicKey = define({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE }),
				});

				const key = await TestPublicKey.get(EXAMPLE);

				assert.equal(key.id, EXAMPLE.id);
			});
		});

		describe('.owner', function () {
			it('should get owner.', async function () {
				const TestPublicKey = define({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE }),
				});

				const key = await TestPublicKey.get(EXAMPLE);

				assert.equal(key.owner, EXAMPLE.owner);
			});
		});

		describe('.createdAt', function () {
			it('should get owner.', async function () {
				const TestPublicKey = define({
					...SAMPLE_OPTIONS,
					get: () => ({ ...EXAMPLE }),
				});

				const key = await TestPublicKey.get(EXAMPLE);

				assert.equal(key.createdAt.getTime(), EXAMPLE.createdAt);
			});
		});
	});
});
