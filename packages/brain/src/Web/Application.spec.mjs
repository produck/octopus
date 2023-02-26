import * as assert from 'node:assert/strict';
import { webcrypto as crypto } from 'node:crypto';
import request from 'supertest';

import * as Octopus from '../index.mjs';

const sleep = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));
const client = request('http://127.0.0.1:8080/api');

describe('Web::Application', function () {
	it('should 400 if bad credential.', function () {

	});

	it('should 408 if expired time.', function () {

	});

	it('should 404 if application not found.', function () {

	});

	it('should 401 if bad signature.', function () {

	});

	describe('GET  /product/{model}', function () {
		// hard
	});

	describe('POST /product/{model}', function () {

	});

	describe('GET  /product/{model}/{productId}', function () {

	});

	describe('PUT  /product/{model}/{productId}/state', function () {

	});

	describe('POST /product/{model}/{productId}/order', function () {

	});

	describe('GET /product/{model}/{productId}/order', function () {

	});

	describe('GET /product/{model}/{productId}/job', function () {

	});

	describe('GET /product/{model}/{productId}/job/{jobId}', function () {

	});

	describe('GET /product/{model}/{productId}/artifact', function () {

	});
});
