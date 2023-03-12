import { Normalizer, P, S } from '@produck/mold';

export const HostSchema = P.String('127.0.0.1');
export const PortSchema = P.Port(9173);

export const ConfigSchema = S.Object({
	at: P.Integer(0),
	interval: P.UINT32(1000),
	timeout: P.UINT32(5000),
	retry: P.UINT8(3),
	host: HostSchema,
	port: PortSchema,
	redirect: P.Boolean(false),
});

export const Schema = S.Object({
	id: P.String(),
	craft: P.String(),
	version: P.String(),
	ready: P.Boolean(),
	job: P.OrNull(P.String(), true),
	config: ConfigSchema,
});

export const normalize = Normalizer(Schema);
export const normalizeConfig = Normalizer(ConfigSchema);
