import type { Interval } from "../../flow/IntervalType.js";
import { sleep } from "../../flow/Sleep.js";
import { isAsyncIterable, isIterable } from "../Iterable.js";
import type { GenFactoryNoInput } from "./Types.js";

export function fromArray<Out>(it: Array<Out>, delay: Interval = 5): GenFactoryNoInput<Out> {
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

