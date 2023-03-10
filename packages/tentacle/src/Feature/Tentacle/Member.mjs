import { webcrypto as crypto } from 'node:crypto';
import { Normalizer, P, S } from '@produck/mold';

import * as RJSP from '../RJSP/index.mjs';

export const MetaSchema = S.Object({
	id: P.String(crypto.randomUUID()),
	craft: P.String('org.produck.octopus.craft.example'),
	version: P.String('0.0.0'),
});

export const ServerSchema = S.Object({
	host: RJSP.Data.HostSchema,
	port: RJSP.Data.PortSchema,
});

export const normalizeMeta = Normalizer(MetaSchema);
export const normalizeServer = Normalizer(ServerSchema);
