import { type Interval, intervalToMs, interval } from "../../flow/Interval.js"
import { Signals } from "../index.js"
import type { Readable, Writeable } from "./Types.js"
import type { InOut } from "../Signal.js";
import { NullSink } from "./index.js";

const Name_Iterable = `feedIterable` as const;
const Name_Generator = `feedGenerator` as const;
const Name_Pipes = `feedPipes` as const;

export type FeedOptions = {
  interval?: Interval
  keepOpen?: boolean
  maximumValues?: number
}

export const feedIterable = <V>(destination: Writeable<V>, iterator: Iterator<V>, options: FeedOptions = {}) => {
  const ms = intervalToMs(options.interval, 0);
  const keepOpen = options.keepOpen ?? false;
  const maximumValues = options.maximumValues ?? Number.MAX_SAFE_INTEGER;
  let count = 0;

  const done = () => {
    if (keepOpen) return;
    destination.inlet(Signals.close(Name_Iterable));
  }

  const read = () => {
    if (count >= maximumValues) {
      done();
      return;
    }
    const n = iterator.next();
    if (n.done) {
      done();
      return;
    } else {
      destination.inlet([ n.value, undefined ]);
      count++;
    }
    setTimeout(read, ms);
  }
  setTimeout(read, ms);
}

export const feedGenerator = async <V>(destination: Writeable<V>, generator: Generator<V> | Iterable<V>, options: FeedOptions = {}) => {
  const keepOpen = options.keepOpen ?? false;
  let maximumValues = options.maximumValues ?? Number.MAX_SAFE_INTEGER;
  const intervalMs = intervalToMs(options.interval, 0);

  if (intervalMs === 0) {
    for (const v of generator) {
      destination.inlet([ v, undefined ]);
      if (--maximumValues <= 0) break;
    }
  } else {
    for await (const v of interval(generator, intervalMs)) {
      destination.inlet([ v, undefined ]);
      if (--maximumValues <= 0) break;
    }
  }
  if (!keepOpen) {
    destination.inlet(Signals.close(Name_Generator));
  }
}

export const feedTrigger = <V>(p: Writeable<V>) => {
  const listener = (value: InOut<V>) => {
    p.inlet(value);
  }
  return listener;
}

export type FeedPipesOptions = {
  close?: `any` | `all` | `never`
}

/**
 * Read values from `sourcePipes` to `destination`.
 * 
 * By default closes destination if all sources close.
 * 
 * Close policies
 * - any: if any source pipe closes, destination closes and all other reading stops
 * - all: destination closes when all source pipes close
 * - never: close signals are filtered
 * @param desination 
 * @param sourcePipes 
 * @param options 
 */
export const feedPipes = <V>(desination: Writeable<V>, sourcePipes: Array<Readable<V>>, options: FeedPipesOptions = {}) => {
  const closePolicy = options.close ?? `all`;
  sourcePipes = [ ...sourcePipes ];
  let closedCount = 0;

  const close = () => {
    for (const source of sourcePipes) {
      source.setOutlet(NullSink);
    }
    desination.inlet(Signals.close(Name_Pipes));
  }

  for (const source of sourcePipes) {
    source.setOutlet((v) => {
      if (Signals.isClosed(v)) {
        switch (closePolicy) {
          case `all`: {
            closedCount++;
            source.setOutlet(NullSink); // Make sure we don't get any more messages from this source
            if (closedCount >= sourcePipes.length) {
              // All pipes are closed
              close();
            }
            return;
          }
          case `any`: {
            // If any source pipe has closed, we
            // ought to as well
            close();
            return;
          }
          case `never`: {
            // Ignore upstream pipes closing
            return;
          } /** no-op */
        }
      }
      desination.inlet(v);
    })
  }
}
