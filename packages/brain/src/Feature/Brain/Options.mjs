import { webcrypto as crypto } from 'node:crypto';
import { S, P, Normalizer } from '@produck/mold';

import * as Data from './Data.mjs';

const now = Date.now();

const EXAMPLE = Data.normalize({
	id: crypto.randomUUID(),
	name: 'example',
	version: '0.0.0',
	createdAt: now,
	visitedAt: now,
});

export const Schema = S.Object({
	name: P.StringPattern(/^[A-Z][a-zA-Z]*$/)('Custom'),
	external: P.Function(() => 0),
	get: P.Function(() => EXAMPLE),
	has: P.Function(() => false),
	query: P.Function(() => []),
});

export const normalize = Normalizer(Schema);
