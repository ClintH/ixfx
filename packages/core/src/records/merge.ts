// Source: https://stackoverflow.com/questions/49682569/typescript-merge-object-types
// jcalz 2021-09-09

type OptionalPropertyNames<T> =
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  { [ K in keyof T ]-?: ({} extends Record<K, T[ K ]> ? K : never) }[ keyof T ];

type SpreadProperties<L, R, K extends keyof L & keyof R> =
  { [ P in K ]: L[ P ] | Exclude<R[ P ], undefined> };

type Id<T> = T extends infer U ? { [ K in keyof U ]: U[ K ] } : never

type SpreadTwo<L, R> = Id<
  & Pick<L, Exclude<keyof L, keyof R>>
  & Pick<R, Exclude<keyof R, OptionalPropertyNames<R>>>
  & Pick<R, Exclude<OptionalPropertyNames<R>, keyof L>>
  & SpreadProperties<L, R, OptionalPropertyNames<R> & keyof L>
>;

export type Spread<A extends readonly [ ...any ]> = A extends [ infer L, ...infer R ] ?
  SpreadTwo<L, Spread<R>> : unknown

export function mergeObjects<A extends object[]>(...a: [ ...A ]) {
  return Object.assign({}, ...a) as Spread<A>;
}