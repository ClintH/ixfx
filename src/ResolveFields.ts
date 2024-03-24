type Primi = number | string | boolean | object;
type PrimiFunc = <T extends Primi>() => T;
//type ResolveValue<T extends Primi | PrimiFunc> = T;

type ResolveValue<T extends Primi | PrimiFunc> = T extends PrimiFunc ? ReturnType<T> : T

const resolveValue = <T extends Primi>(value: T | (() => T)): T => {
  if (typeof value === `function`) {
    return value() as T;
  }
  return value;
}

type ResolvedValues<Type extends Record<string, Primi | PrimiFunc>> = {
  [ Property in keyof Type ]: ResolveValue<Type[ Property ]>
}

const t = resolveValue(10);
const t2 = resolveValue(() => true);
// export const resolveState = <T extends Record<string, StateValue>>(state: T): Record<keyof T, number | string | boolean | object> => {
//   return state;
// }

// const resolveState = <T extends Record<string, Primi | PrimiFunc>>(state: T): ResolvedValues<T> => {
//   return Object.fromEntries(Object.entries(state).map(entry => {
//     if (typeof entry[ 1 ] === `function`) return [ entry[ 0 ], entry[ 1 ]() ];
//     return entry;
//   }))
// }

// const testState = {
//   x: 10,
//   resolveX: () => true
// };
// const testResolved = resolveState(testState);
// testResolved.resolveX;
// testResolved.x;