import { webcrypto as crypto } from 'crypto';
import { Normalizer, P, S } from '@produck/mold';

const ID = crypto.randomUUID();

export const SchemaItems = {
	has: P.Function(() => false),
	get: P.Function(() => ID),
	create: P.Function(() => {}),
	clean: P.Function(() => {}),
};

export const Schema = S.Object(SchemaItems);
export const normalize = Normalizer(Schema);
