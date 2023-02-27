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
		it('should 400 if bad procedure.', function () {

		});

		it('should get a list of product.', function () {

		});
	});

	describe('POST /product/{model}', function () {
		it('should 429 if queue overflow.', function () {

		});

		it('should create a new product.', function () {

		});
	});

	describe('GET  /product/{model}/{productId}', function () {
		it('should 404 if not found.', function () {

		});

		it('should get a existent product.', function () {

		});
	});

	describe('PUT  /product/{model}/{productId}/state', function () {
		it('should 403 if product is finished.', function () {

		});

		it('should finish a proudct.', function () {

		});
	});

	describe('POST /product/{model}/{productId}/order', function () {
		it('should 403 if product is ordered.', function () {

		});

		it('should 403 if product is finished.', function () {

		});

		it('should 400 if bad order data.', function () {

		});

		it('should set order of a product.', function () {

		});
	});

	describe('GET /product/{model}/{productId}/order', function () {
		it('should 404 if product is not ordered.', function () {

		});

		it('should get product order.', function () {

		});
	});

	describe('GET /product/{model}/{productId}/job', function () {
		it('should get a job list.', function () {

		});
	});

	describe('GET /product/{model}/{productId}/job/{jobId}', function () {
		it('should 404 if job not found.', function () {

		});

		it('should 404 if job does not belong to product.', function () {

		});

		it('should get a job.', function () {

		});
	});

	describe('GET /product/{model}/{productId}/artifact', function () {
		it('should 404 if unfinished.', function () {

		});

		it('should 404 if failed.', function () {

		});
	});
});
