import { webcrypto as crypto } from 'node:crypto';
import { Normalizer, P, S } from '@produck/mold';

import * as RJSP from './Feature/RJSP/index.mjs';

export const ServerSchema = S.Object({
	host: RJSP.Data.HostSchema,
	port: RJSP.Data.PortSchema,
});

export const Schema = S.Object({
	id: P.String(crypto.randomUUID()),
	ready: P.Boolean(true),
	active: P.Boolean(false),
	job: P.OrNull(P.String()),
	config: RJSP.Data.ConfigSchema,
	server: ServerSchema,
});

export const normalize = Normalizer(Schema);
