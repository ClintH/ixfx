import { promiseFromEvent } from "../../../flow/PromiseFromEvent.js";
import type { GenFactoryNoInput } from "../Types.js";

export function event<Out>(target: EventTarget, name: string): GenFactoryNoInput<Out> {
  async function* fromEvent(): AsyncGenerator<Out> {
    while (true) {
      yield await promiseFromEvent(target, name) as Out;
    }
  }
  fromEvent._name = `fromEvent`;
  /* eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion */
  fromEvent._type = `GenFactoryNoInput` as const;
  return fromEvent;
}


//https://stackoverflow.com/questions/51045136/how-can-i-use-a-event-emitter-as-an-async-generator