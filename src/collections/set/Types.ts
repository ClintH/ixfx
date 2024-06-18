export type ValueSetEventMap<V> = {
  readonly add: { readonly value: V; readonly updated: boolean };
  readonly clear: boolean;
  readonly delete: V;
};