import * as assert from 'node:assert/strict';
import { describe, it } from 'mocha';

import * as Octopus from './index.mjs';

describe('OctopusBrain()', function () {
	it('should create a OctopusBrain.', function () {
		Octopus.Brain();
	});

	describe('.Model()', function () {
		it('should register a new model.', function () {
			const TestBrain = Octopus.Brain();

			TestBrain.Model('foo');
		});
	});

	describe('.Craft()', function () {
		it('should register a new craft.', function () {
			const TestBrain = Octopus.Brain();

			TestBrain.Craft('foo');
		});
	});
});
