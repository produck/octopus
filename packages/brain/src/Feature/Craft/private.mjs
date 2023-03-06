const map = new WeakMap();
export const _ = CraftProxy => map.get(CraftProxy);
export const set = (CraftProxy, context) => map.set(CraftProxy, context);
