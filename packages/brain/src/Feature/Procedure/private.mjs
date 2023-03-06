const map = new WeakMap();
export const _ = ProcedureProxy => map.get(ProcedureProxy);
export const set = (ProcedureProxy, context) => map.set(ProcedureProxy, context);
