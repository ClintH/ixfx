import { promiseFromEvent } from "../../../flow/PromiseFromEvent.js";
import type { GenFactoryNoInput } from "../Types.js";

/**
 * Create an iterable from an event
 * @param target Event source (eg HTML element)
 * @param name Name of event (eg. 'pointermove')
 * @returns 
 */
export function event<Out>(target: EventTarget, name: string): GenFactoryNoInput<Out> {
  async function* event(): AsyncGenerator<Out> {
    while (true) {
      yield await promiseFromEvent(target, name) as Out;
    }
  }
  event._name = `event`;
  /* eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion */
  event._type = `GenFactoryNoInput` as const;
  return event;
}


//https://stackoverflow.com/questions/51045136/how-can-i-use-a-event-emitter-as-an-async-generator