const map = new WeakMap();
export const _ = BrainProxy => map.get(BrainProxy);
export const set = (BrainProxy, context) => map.set(BrainProxy, context);
