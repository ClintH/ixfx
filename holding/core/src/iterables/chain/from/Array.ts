import type { Interval } from "../../../flow/IntervalType.js";
import { sleep } from "../../../flow/Sleep.js";
import type { GenFactoryNoInput } from "../Types.js";

/**
 * Creates a chain from an array, reading values at a given interval
 * @param it 
 * @param delay 
 * @returns 
 */
export function array<Out>(it: Array<Out>, delay: Interval = 5): GenFactoryNoInput<Out> {
  async function* fromArray(): AsyncGenerator<Out> {
    for (const v of it) {
      await sleep(delay);
      yield v;
    }
  }
  fromArray._name = `fromArray`;
  /* eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion */
  fromArray._type = `GenFactoryNoInput` as const;
  return fromArray;
}

