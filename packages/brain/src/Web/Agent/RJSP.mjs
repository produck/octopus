import { Normalizer, P, S } from '@produck/mold';

export const ConfigurationSchema = S.Object({
	age: P.Integer(0),
	syncInterval: P.UINT32(),
	syncTimeout: P.UINT32(),
	syncRetryInterval: P.UINT32(),
	host: P.String(),
	port: P.Port(),
	redirecting: P.Boolean(),
});

export const Schema = S.Object({
	id: P.String(),
	craft: P.String(),
	version: P.String(),
	ready: P.Boolean(),
	job: P.OrNull(P.String(), true),
	config: ConfigurationSchema,
});

export const normalize = Normalizer(Schema);
