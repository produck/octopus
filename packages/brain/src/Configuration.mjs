import { webcrypto as crypto } from 'node:crypto';
import { Normalizer, P, S } from '@produck/mold';

const BANNER = [
	'  ____  _______________  ___  __  ______',
	' / __ \\/ ___/_  __/ __ \\/ _ \\/ / / / __/',
	'/ /_/ / /__  / / / /_/ / ___/ /_/ /\\ \\  ',
	'\\____/\\___/ /_/  \\____/_/   \\____/___/  ',
];

export const Schema = S.Object({
	id: P.String(crypto.randomUUID()),
	banner: S.Array({ items: P.String() }, () => [...BANNER]),
	runtime: P.Enum(['SOLO', 'PROCESSES']),
	workspace: P.String('.data'),
	application: S.Object({
		mode: P.Enum(['HTTP', 'HTTPS', 'REDIRECT', 'BOTH']),
		http: S.Object({
			host: P.String('0.0.0.0'),
			port: P.Port(80),
		}),
		https: S.Object({
			host: P.String('0.0.0.0'),
			port: P.Port(443),
			key: P.String('key.pem'),
			cert: P.String('cert.pem'),
		}),
	}),
	agent: S.Object({
		host: P.String('0.0.0.0'),
		port: P.Port(9173),
	}),
});

export const normalize = Normalizer(Schema);
