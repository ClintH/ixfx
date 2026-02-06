// Shared test utilities for iterables tests

/**
 * Converts an async iterable to an array
 */
export const asyncIterableToArray = async <T>(iterable: AsyncIterable<T>): Promise<T[]> => {
  const result: T[] = [];
  for await (const item of iterable) {
    result.push(item);
  }
  return result;
};

/**
 * Converts a sync iterable to an array
 */
export const iterableToArray = <T>(iterable: Iterable<T>): T[] => {
  return [...iterable];
};

/**
 * Creates an async iterable that yields items with a delay between each
 */
export const createDelayedAsyncIterable = <T>(items: T[], delayMs: number): AsyncIterable<T> => {
  return {
    [Symbol.asyncIterator]: async function* () {
      for (const item of items) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
        yield item;
      }
    }
  };
};

/**
 * Creates an async generator from an array
 */
export async function* createAsyncGenerator<T>(items: T[]): AsyncGenerator<T> {
  for (const item of items) {
    yield item;
  }
}

/**
 * Collects the first n items from an iterable
 */
export const take = <T>(iterable: Iterable<T>, n: number): T[] => {
  const result: T[] = [];
  for (const item of iterable) {
    result.push(item);
    if (result.length >= n) break;
  }
  return result;
};

/**
 * Collects the first n items from an async iterable
 */
export const takeAsync = async <T>(iterable: AsyncIterable<T>, n: number): Promise<T[]> => {
  const result: T[] = [];
  for await (const item of iterable) {
    result.push(item);
    if (result.length >= n) break;
  }
  return result;
};
