import { Normalizer, P, S } from '@produck/mold';

const ConfigurationSchema = S.Object({
	at: P.Integer(),
	interval: P.UINT32(),
	timeout: P.UINT32(),
	host: P.String(),
	port: P.Port(),
	redirect: P.Boolean(),
});

const DataSchema = S.Object({
	id: P.String(),
	craft: P.String(),
	version: P.String(),
	ready: P.Boolean(),
	job: P.OrNull(P.String(), true),
	config: ConfigurationSchema,
});

export const normalizeData = Normalizer(DataSchema);
