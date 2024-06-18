export type ArrayLengthMutationKeys = `splice` | `push` | `pop` | `shift` | `unshift` | number
export type ArrayItems<T extends Array<any>> = T extends Array<infer TItems> ? TItems : never
export type FixedLengthArray<T extends Array<any>> =
  Pick<T, Exclude<keyof T, ArrayLengthMutationKeys>>
  & { [ Symbol.iterator ]: () => IterableIterator<ArrayItems<T>> }