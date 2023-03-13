import { Normalizer, P, S } from '@produck/mold';

const DEFAULT_TIMEOUT = 60000;

export const Schema = S.Object({
	host: P.Function(() => '127.0.0.1'),
	port: P.Function(() => 9173),
	job: P.Function(() => 'example'),
	timeout: P.Function(() => DEFAULT_TIMEOUT),
});

export const normalize = Normalizer(Schema);
