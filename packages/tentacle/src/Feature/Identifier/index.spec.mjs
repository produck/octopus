import { webcrypto as crypto } from 'node:crypto';
import * as assert from 'node:assert/strict';
import * as Identifier from './index.mjs';

describe('Feature::Identifier::Accessor', function () {
	describe('constructor()', function () {
		it('should create a accessor.', function () {
			new Identifier.Accessor();
		});
	});

	describe('value', function () {
		it('should get a string.', function () {
			assert.ok(typeof new Identifier.Accessor().value === 'string');
		});
	});

	describe('has()', function () {
		it('should be false.', async function () {
			const identifier = new Identifier.Accessor({ has: () => false });

			assert.equal(await identifier.has(), false);
		});

		it('should be true', async function () {
			const identifier = new Identifier.Accessor({ has: () => true });

			assert.equal(await identifier.has(), true);
		});

		it('should throw if bad flag.', async function () {
			const identifier = new Identifier.Accessor({ has: () => null });

			await assert.rejects(async () => await identifier.has(), {
				name: 'TypeError',
				message: 'Invalid "flag", one "boolean" expected.',
			});
		});
	});

	describe('read()', function () {
		it('should set a new id value.', async function () {
			const id = crypto.randomUUID();
			const identifier = new Identifier.Accessor({ get: () => id });

			assert.notEqual(identifier.value, id);
			await identifier.read();
			assert.equal(identifier.value, id);
		});
	});

	describe('write()', function () {
		it('should change id and set to value.', async function () {
			const originId = crypto.randomUUID();
			let id = originId;

			const identifier = new Identifier.Accessor({
				get: () => id,
				create: () => id = crypto.randomUUID(),
			});

			await identifier.read();
			assert.equal(identifier.value, originId);
			await identifier.write();
			assert.notEqual(identifier.value, originId);
		});
	});

	describe('clean()', function () {
		it('should call options clean.', async function () {
			let flag = false;
			const identifier = new Identifier.Accessor({ clean: () => flag = true });

			await identifier.clean();
			assert.equal(flag, true);
		});
	});
});
