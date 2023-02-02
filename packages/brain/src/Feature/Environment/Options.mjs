import { Normalizer, P, S } from '@produck/mold';
import * as Property from './Property.mjs';

export const Schema = S.Object({
	name: P.StringPattern(/^[A-Z][a-zA-Z]*$/)('Custom'),
	fetch: P.Function(() => Property.normalize({})),
	set: P.Function(() => {}),
});

export const normalize = Normalizer(Schema);
