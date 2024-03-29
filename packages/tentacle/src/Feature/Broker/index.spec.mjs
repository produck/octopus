import * as assert from 'node:assert/strict';
import * as Broker from './index.mjs';

const sleep = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

describe('Feature::Broker', function () {
	describe('constructor()', function () {
		it('should create a Broker.', function () {
			new Broker.Broker();
		});
	});

	describe('.busy', function () {
		it('should be false.', function () {
			const broker = new Broker.Broker();

			assert.equal(broker.busy, false);
		});

		it('should be true.', async function () {
			const broker = new Broker.Broker({
				run: async (work) => {
					await sleep();
					work.complete('foo');
				},
			});

			broker.run({});
			assert.equal(broker.busy, true);
		});
	});

	describe('.ready', function () {
		it('should be true.', function () {
			const broker = new Broker.Broker();

			assert.equal(broker.ready, true);
		});

		it('should be false.', function () {
			const broker = new Broker.Broker({
				run: async (work) => {
					await sleep();
					work.complete('foo');
				},
			});

			broker.run();
			broker.abort();
			assert.equal(broker.ready, false);
		});
	});

	describe('.run()', function () {
		it('should throw if busy.', async function () {
			const broker = new Broker.Broker({
				run: async (work) => {
					await sleep();
					work.complete('foo');
				},
			});

			broker.run({});

			await assert.rejects(async () => await broker.run(), {
				name: 'Error',
				message: 'Broker is busy!',
			});
		});

		it('should work to OK.', async function () {
			const broker = new Broker.Broker({
				run: async (work) => {
					await sleep();
					work.complete('foo');
				},
			});

			const result = await broker.run({});

			assert.deepEqual(result, { ok: true, target: 'foo' });
		});

		it('should throw if not ready.', function () {
			const broker = new Broker.Broker({
				run: async (work) => {
					await sleep();
					work.complete('foo');
				},
				abort: () => {},
			});

			broker.run({});
			broker.abort();

			assert.rejects(() => broker.abort(), {
				name: 'Error',
				message: 'Broker is NOT ready.',
			});
		});

		it('should throw if work throw.', async function () {
			const broker = new Broker.Broker({
				run: async () => {
					await sleep();
					throw new Error('foo');
				},
			});

			await assert.rejects(async () => await broker.run({}), {
				name: 'Error',
				message: 'foo',
			});
		});
	});

	describe('.abort()', function () {
		it('should make ready false.', async function () {
			const broker = new Broker.Broker({
				run: async (work) => {
					await sleep();
					work.complete('foo');
				},
			});

			broker.run({});
			broker.abort({});
			assert.equal(broker.ready, false);
			await sleep(1500);
			assert.equal(broker.ready, true);
		});

		it('should abort but do nothing.', function () {
			new Broker.Broker().abort();
		});

		it('should abort.', async function () {
			const broker = new Broker.Broker({
				run: async (work) => {
					await sleep();
					work.complete('foo');
				},
				abort: () => {},
			});

			broker.run({});
			broker.abort({});
			assert.equal(broker.ready, false);
			await sleep(2000);
			assert.equal(broker.ready, true);
		});
	});
});

describe('Feature::Work', function () {
	describe('constructor()', function () {
		it('should create a Work.', function () {
			new Broker.Work(() => {}, {});
		});
	});

	describe('.isDestroyed', function () {
		it('should get true.', function () {
			const work = new Broker.Work();

			Broker.Work.destroy(work);
			assert.equal(work.isDestroyed, true);
		});

		it('should get false.', function () {
			assert.equal(new Broker.Work().isDestroyed, false);
		});
	});

	describe('.throw()', function () {
		it('should set a error.', function () {
			const work = new Broker.Work((result) => {
				assert.deepEqual(result, { ok: false, message: null });
			});

			work.throw();
			work.throw();
		});

		it('should throw if bad message.', function () {
			const work = new Broker.Work();

			assert.throws(() => work.throw(1), {
				name: 'TypeError',
				message: 'Invalid "message", one "string or null" expected.',
			});
		});
	});

	describe('.complete()', function () {
		it('should set a target.', function () {
			const work = new Broker.Work((result) => {
				assert.deepEqual(result, { ok: true, target: 'foo' });
			});

			work.complete('foo');
		});
	});

	describe('::destroy()', function () {
		it('should destroy work.', function () {
			const work = new Broker.Work();

			assert.equal(work.isDestroyed, false);
			Broker.Work.destroy(work);
			assert.equal(work.isDestroyed, true);
		});
	});
});
