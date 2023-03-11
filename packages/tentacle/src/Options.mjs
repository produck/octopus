import { Normalizer, P, S } from '@produck/mold';
import * as Feature from './Feature/index.mjs';

export const Schema = S.Object({
	craft: P.String('example'),
	version: P.String('0.0.0'),
	...Feature.Broker.Options.MemberSchemaas,
});

export const normalize = Normalizer(Schema);
