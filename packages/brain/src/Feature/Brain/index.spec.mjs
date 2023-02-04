import * as assert from 'node:assert/strict';
import { describe, it } from 'mocha';

import { defineBrain } from './index.mjs';

describe('Feature::Brain', function () {
	describe('::defineBrain()', function () {
		it('should create a CustomBrain.', function () {
			const CustomBrain = defineBrain();

			assert.equal(CustomBrain.name, 'CustomBrainProxy');
		});
	});

	describe('::TestBrain', function () {
		describe('::has()', function () {

		});

		describe('::get()', function () {

		});

		describe('::query()', function () {

		});

		describe('::on()', function () {

		});

		describe('::off()', function () {

		});

		describe('::once()', function () {

		});

		describe('::boot()', function () {

		});

		describe('::halt()', function () {

		});

		describe('::NOW', function () {

		});

		describe('::WATCHING_INTERVAL', function () {

		});

		describe('::MAX_ALIVE_GAP', function () {

		});

		describe('::isActive', function () {

		});

		describe('::current', function () {

		});

		describe('.load()', function () {

		});

		describe('.toJSON()', function () {

		});
	});
});
