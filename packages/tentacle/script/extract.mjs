import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const meta = require('../package.json');

const versionJSFile = path.resolve('src/meta.gen.mjs');
const keys = ['name', 'version', 'description'];

const code = keys
	.map(key => `export const ${key} = '${meta[key]}';`)
	.join('\n');

fs.writeFileSync(versionJSFile, code);
