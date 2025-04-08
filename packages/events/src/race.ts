/**
 * Subscribes to events on `target`, returning the event data
 * from the first event that fires.
 * 
 * By default waits a maximum of 1 minute.
 * 
 * Automatically unsubscribes on success or failure (ie. timeout)
 * 
 * ```js
 * // Event will be data from either event, whichever fires first
 * // Exception is thrown if neither fires within 1 second
 * const event = await eventRace(document.body, [`pointermove`, `pointerdown`], { timeout: 1000 });
 * ```
 * @param target Event source
 * @param eventNames Event name(s)
 * @param options Options
 * @returns 
 */
export const eventRace = (target: EventTarget, eventNames: Array<string>, options: Partial<{ timeoutMs: number, signal: AbortSignal }> = {}) => {
  const intervalMs = options.timeoutMs ?? 60_1000; //intervalToMs(options.timeout, 60 * 1000);
  const signal = options.signal;
  let triggered = false;
  let disposed = false;
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const promise = new Promise<Event>((resolve, reject) => {
    const onEvent = (event: Event) => {
      if (`type` in event) {
        if (eventNames.includes(event.type)) {
          triggered = true;
          resolve(event);
          dispose();
        } else {
          console.warn(`eventRace: Got event '${ event.type }' that is not in race list`);
        }
      } else {
        console.warn(`eventRace: Event data does not have expected 'type' field`);
        console.log(event);
      }
    }

    for (const name of eventNames) {
      target.addEventListener(name, onEvent);
    }

    const dispose = () => {
      if (disposed) return;
      if (timeout !== undefined) clearTimeout(timeout);
      timeout = undefined;
      disposed = true;
      for (const name of eventNames) {
        target.removeEventListener(name, onEvent);
      }
    }

    timeout = setTimeout(() => {
      if (triggered || disposed) return;
      dispose();
      reject(new Error(`eventRace: Events not fired within interval. Events: ${ JSON.stringify(eventNames) } Interval: ${ intervalMs }`));
    }, intervalMs);


    signal?.addEventListener(`abort`, () => {
      if (triggered || disposed) return;
      dispose();
      reject(new Error(`Abort signal received ${ signal.reason }`));
    });
  });
  return promise;
}