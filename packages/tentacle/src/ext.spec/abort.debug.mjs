import * as http from 'node:http';
import { webcrypto as crypto } from 'node:crypto';
import * as Octopus from '../index.mjs';

const EXAMPLE = {
	id: crypto.randomUUID(), craft: 'example', version: '0.0.0',
	ready: true, job: null,
	config: {
		at: Date.now(), interval: 1000, timeout: 5000, retry: 3,
		host: '127.0.0.1', port: 9174, redirect: false,
	},
};

let job;
const SOURCE_REG = /\/api\/job\/[\w\d-]+\/source/;
const sleep = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

const server = http.createServer((req, res) => {
	res.statusCode = 200;
	console.log(req.url);

	if (req.url === '/api/sync') {
		res.setHeader('Content-Type', 'application/json');
		res.end(JSON.stringify({ ...EXAMPLE, job }));
	} else if (SOURCE_REG.test(req.url)) {
		res.end(JSON.stringify({}));
	} else {
		res.socket.destroy();
	}
});

server.listen(9174, '127.0.0.1');

const tentacle = Octopus.Tentacle({
	craft: 'example',
	version: '0.0.0',
	shared: () => ({}),
	run: async (work) => {
		await sleep(10000);
		work.complete({});
	},
	abort: () => {},
});

await tentacle.boot(['-m', 'solo', '-p', '9174']);
job = crypto.randomUUID();
await sleep(5000);
job = crypto.randomUUID();
await sleep(2000);
tentacle.halt();
console.log('halt');
server.close();
