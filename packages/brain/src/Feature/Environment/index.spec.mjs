import * as assert from 'node:assert/strict';
import { describe, it } from 'mocha';

import { AbstractEnvironment } from './Abstract.mjs';
import { defineEnvironment } from './index.mjs';

const sleep = (ms = 10) => new Promise(resolve => setTimeout(resolve, ms));

describe('::Ferture::Environment', function () {
	describe('::AbstractEnvironment', function () {
		it('should throw if not implement.', async function () {
			const env = new AbstractEnvironment();

			await assert.rejects(() => env._fetch(), {
				name: 'Error',
				message: 'Method \'._fetch()\' MUST be implemented.',
			});

			await assert.rejects(() => env._set(), {
				name: 'Error',
				message: 'Method \'._set()\' MUST be implemented.',
			});
		});
	});

	describe('::defineEnvironment()', function () {
		it('should create a CustomEnvironment.', function () {
			const CustomEnvironment = defineEnvironment({});

			assert.equal(CustomEnvironment.name, 'CustomEnvironment');
		});
	});

	describe('::CustomEvnironment', function () {
		describe('.isBusy', function () {
			it('should be false.', function () {
				const CustomEnvironment = defineEnvironment({});
				const env = new CustomEnvironment();

				assert.equal(env.isBusy, false);
			});
		});

		describe('.start()', function () {
			it('it should start.', async function () {
				const CustomEnvironment = defineEnvironment({});
				const env = new CustomEnvironment();

				env.start();
				assert.equal(env.isBusy, true);
				await sleep();
				env.stop();
			});

			it('should throw if busy.', async function () {
				const CustomEnvironment = defineEnvironment({});
				const env = new CustomEnvironment();

				env.start();

				assert.throws(() => env.start(), {
					name: 'Error',
					message: 'It has been running.',
				});

				await sleep();
				env.stop();
			});
		});

		describe('.stop()', function () {
			it('should stop', async function () {
				const CustomEnvironment = defineEnvironment({});
				const env = new CustomEnvironment();

				env.start();
				assert.equal(env.isBusy, true);
				await sleep();
				env.stop();
				assert.equal(env.isBusy, false);
			});
		});

		describe('.get()', function () {
			const CustomEnvironment = defineEnvironment({});
			const env = new CustomEnvironment();

			it('should get a value.', function () {
				assert.ok(typeof env.get('ENVIRONMENT.AT') === 'number');
			});

			it('should throw if bad name.', function () {
				assert.throws(() => env.get(1), {
					name: 'TypeError',
					message: 'Invalid "name", one "string" expected.',
				});
			});

			it('should throw if name is undefined.', function () {
				assert.throws(() => env.get('foo'), {
					name: 'Error',
					message: 'Undefined property name(foo).',
				});
			});
		});

		describe('.set()', function () {
			const CustomEnvironment = defineEnvironment({});

			it('should set a value.', async function () {
				const env = new CustomEnvironment();

				await env.set('APPLICATION.REQUEST.TIMEOUT', 50000);
			});

			it('should emit set-error if bad _set().', async function () {
				const CustomEnvironment = defineEnvironment({
					set() {
						throw new Error('foo');
					},
				});

				const flag = {};
				const env = new CustomEnvironment();

				env.on('set-error', function () {
					flag.a = true;
				});

				await env.set('APPLICATION.REQUEST.TIMEOUT', 500000);
				assert.equal(flag.a, true);
			});
		});

		describe('.fetch()', function () {
			it('should emit fetch-error if bad _fetch().', async function () {
				const CustomEnvironment = defineEnvironment({
					fetch() {
						throw new Error('foo');
					},
				});

				const flag = {};
				const env = new CustomEnvironment();

				env.on('fetch-error', error => {
					assert.equal(error.name, 'Error');
					assert.equal(error.message, 'Bad `._fetch()`.');
					flag.a = true;
				});

				await env.fetch();

				assert.equal(flag.a, true);
			});

			it('should emit data-error if bad data.', async function () {
				const CustomEnvironment = defineEnvironment({
					fetch: () => null,
				});

				const flag = {};
				const env = new CustomEnvironment();

				env.on('data-error', error => {
					assert.equal(error.name, 'TypeError');
					assert.equal(error.message, 'Invalid `._fetch() => data`.');
					flag.a = true;
				});

				await env.fetch();
				assert.equal(flag.a, true);
			});
		});
	});
});
