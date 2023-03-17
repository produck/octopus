import { Normalizer, P } from '@produck/mold';

const ID = '00000000-0000-0000-0000-000000000000';
const UUID_REG = /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/;
const Schema = P.StringPattern(UUID_REG, 'uuid')(ID);

export const normalize = Normalizer(Schema);
