import { Normalizer, S } from '@produck/mold';
import * as Application from './Application/index.mjs';

export const Schema = S.Array({ items: Application.Data.Schema });
export const normalize = Normalizer(Schema);
