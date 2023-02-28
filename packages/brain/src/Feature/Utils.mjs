import { Normalizer, P } from '@produck/mold';

export const UUID_REG = /^[0-9a-f]{8}-([0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

export const UUIDSchema = P.StringPattern(UUID_REG)();
export const normalizeUUID = Normalizer(UUIDSchema);
