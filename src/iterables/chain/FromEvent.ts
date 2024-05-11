import type { GenFactoryNoInput } from "./Types.js";
import { oncePromise } from "./Util.js";

export function fromEvent<Out>(target: EventTarget, name: string): GenFactoryNoInput<Out> {
  async function* fromEvent(): AsyncGenerator<Out> {
    while (true) {
      yield await oncePromise(target, name) as Out;
    }
  }
  fromEvent._name = `fromEvent`;
  /* eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion */
  fromEvent._type = `GenFactoryNoInput` as const;
  return fromEvent;
}