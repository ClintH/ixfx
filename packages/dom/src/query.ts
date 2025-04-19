import { uniqueInstances } from "@ixfx/core";
export type ElementQueryOptions = {
  /**
   * If true, elements are only returned once, even if that match several queries
   */
  ensureUnique: boolean
}

/**
 * Async iterator over DOM query strings
 * ```js
 * query(`div`); // all DIVs
 * query([`.class`, `.and-other-class`]); // All things with these two classes
 * ```
 * @param queryOrElement 
 * @returns 
 */
export async function* query(queryOrElement: string | HTMLElement | (string | HTMLElement)[] | AsyncGenerator<string | HTMLElement>, options: Partial<ElementQueryOptions> = {}): AsyncGenerator<HTMLElement> {

  if (typeof queryOrElement === `string`) {
    return query([ queryOrElement ], options);
  } else if (typeof queryOrElement === `object` && `nodeName` in queryOrElement) {
    return query([ queryOrElement ], options);
  }

  const ensureUnique = options ?? false;
  const isUnique = ensureUnique ? uniqueInstances<HTMLElement>() : (_: HTMLElement) => true;

  if (Array.isArray(queryOrElement)) {
    for (const item of queryOrElement) {
      if (typeof item === `string`) {
        for (const element of document.querySelectorAll(item)) {
          const elementProper = element as HTMLElement;
          if (isUnique(elementProper)) {
            yield elementProper;
          }
        }
      } else {
        if (isUnique(item)) {
          yield item;
        }
      }
    }
  } else {
    for await (const item of queryOrElement) {
      if (typeof item === `string`) {
        for (const element of document.querySelectorAll(item)) {
          if (isUnique(element as HTMLElement)) {
            yield element as HTMLElement;
          }
        }
      } else {
        if (isUnique(item)) {
          yield item;
        }
      }
    }
  }
}