import type { GenFactoryNoInput } from "../Types.js";

/**
 * Creates a chain from an interable
 * @param it 
 * @returns 
 */
export function iterable<Out>(it: Iterable<Out> | AsyncIterable<Out>): GenFactoryNoInput<Out> {
  async function* fromIterable(): AsyncGenerator<Out> {
    for await (const v of it) {
      yield v;
    }
  }
  fromIterable._name = `fromIterable`;
  /* eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion */
  fromIterable._type = `GenFactoryNoInput` as const;
  return fromIterable;
}