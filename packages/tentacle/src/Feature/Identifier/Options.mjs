import { webcrypto as crypto } from 'crypto';
import { Normalizer, P, S } from '@produck/mold';

const ID = crypto.randomUUID();

export const Schema = S.Object({
	has: P.Function(() => false),
	get: P.Function(() => ID),
	create: P.Function(() => {}),
	clean: P.Function(() => {}),
});

export const normalize = Normalizer(Schema);
