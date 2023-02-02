import { C, Normalizer, P, S } from '@produck/mold';

const JsonRpcRequestSchema = S.Object({

});

const JsonRpcResponseSchema = S.Object({

});

const JsonRpcDatagramSchema = C.Or([
	JsonRpcRequestSchema,
	JsonRpcResponseSchema,
]);

export const ConfigurationSchema = S.Object({
	syncInterval: P.UINT32(),
	syncTimeout: P.UINT32(),
	syncRetryInterval: P.UINT32(),
	host: P.String(),
	port: P.Port(),
});

export const JobStatusSchema = S.Object({
	id: P.String(),
});

export const MetaSchema = S.Object({
	craft: P.String(),
	version: P.String(),
});

export const Schema = S.Object({
	id: P.String(),
	meta: MetaSchema,
	ready: P.Boolean(),
	job: P.OrNull(P.String(), true),
	config: ConfigurationSchema,
	rpc: S.Array({ items: JsonRpcDatagramSchema }),
});

export const normalize = Normalizer(Schema);
