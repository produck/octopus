const IGNORABLE = 0x10;
const RETRIEABLE = 0x20;
const CRITICAL = 0x40;

export const isRetrieable = code => (code & RETRIEABLE) > 0;
export const isIgnorable = code => (code & IGNORABLE) > 0;
export const isCritical = code => (code & CRITICAL) > 0;
export const isOK = code => (0xF0 & code) === 0;
