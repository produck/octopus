import * as assert from 'node:assert/strict';
import supertest from 'supertest';
import { describe, it } from 'mocha';

import * as Octopus from '../index.mjs';

const Backend = {
	Application: [],
	PublicKey: [],
	Brain: [],
	Tentacle: [],
	Environment: {},
	Job: [],
	Product: [],
};

function Brain(id) {
	return Octopus.Brain({
		id, name: 'Test', version: '1.0.0',

	});
}

describe('Play::Principal', function () {
	describe('solo', function () {

	});

	describe('cluster', function () {

	});
});
