/**
 * Functions which modify an array
 */
export type ArrayLengthMutationKeys = `splice` | `push` | `pop` | `shift` | `unshift` | number

/**
 * Array items
 */
export type ArrayItems<T extends any[]> = T extends (infer TItems)[] ? TItems : never

/**
 * A fixed-length array
 */
export type FixedLengthArray<T extends any[]> =
  Pick<T, Exclude<keyof T, ArrayLengthMutationKeys>>
  & { [ Symbol.iterator ]: () => IterableIterator<ArrayItems<T>> }