import { type Interval, sleep } from "@ixfx/core";
import type { GenFactoryNoInput } from "../types.js";

/**
 * Creates a chain from an array, reading values at a given interval
 * @param it 
 * @param delay 
 * @returns 
 */
export function array<Out>(it: Out[], delay: Interval = 5): GenFactoryNoInput<Out> {
  async function* fromArray(): AsyncGenerator<Out> {
    for (const v of it) {
      await sleep(delay);
      yield v;
    }
  }
  fromArray._name = `fromArray`;

  fromArray._type = `GenFactoryNoInput` as const;
  return fromArray;
}

