import * as http from 'node:http';
import * as Octopus from '../index.mjs';

http.createServer(() => {}).listen(80, '0.0.0.0');
const brain = Octopus.Brain();

brain.configuration.runtime = 'PROCESSES';
brain.boot(['start']);
