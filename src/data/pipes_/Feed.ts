// import { type Interval, intervalToMs, interval } from "../../flow/Interval.js"
// import * as Signals from "./Signal.js"
// import type { IReadable, IWriteable } from "./Types.js"
// import type { InOut } from "./Signal.js";

// const Name_Iterable = `feedIterable` as const;
// const Name_Generator = `feedGenerator` as const;
// const Name_Pipes = `feedPipes` as const;

// export type FeedOptions = {
//   interval?: Interval
//   keepOpen?: boolean
//   maximumValues?: number
// }

// export const feedIterable = <V>(destination: IWriteable<V>, iterator: Iterator<V>, options: FeedOptions = {}) => {
//   const ms = intervalToMs(options.interval, 0);
//   const keepOpen = options.keepOpen ?? false;
//   const maximumValues = options.maximumValues ?? Number.MAX_SAFE_INTEGER;
//   let count = 0;

//   const done = () => {
//     if (keepOpen) return;
//     destination.signal({ source: Name_Iterable, type: `closed` });
//   }

//   const read = () => {
//     if (count >= maximumValues) {
//       done();
//       return;
//     }
//     const n = iterator.next();
//     if (n.done) {
//       done();
//       return;
//     } else {
//       destination.pushValue(n.value);
//       count++;
//     }
//     setTimeout(read, ms);
//   }
//   setTimeout(read, ms);
// }

// export const feedGenerator = async <V>(destination: IWriteable<V>, generator: Generator<V> | Iterable<V>, options: FeedOptions = {}) => {
//   const keepOpen = options.keepOpen ?? false;
//   let maximumValues = options.maximumValues ?? Number.MAX_SAFE_INTEGER;
//   const intervalMs = intervalToMs(options.interval, 0);

//   if (intervalMs === 0) {
//     for (const v of generator) {
//       destination.pushValue(v);;
//       if (--maximumValues <= 0) break;
//     }
//   } else {
//     for await (const v of interval(generator, intervalMs)) {
//       destination.pushValue(v);
//       if (--maximumValues <= 0) break;
//     }
//   }
//   if (!keepOpen) {
//     destination.signal({ source: Name_Generator, type: `closed` });
//   }
// }

// export const feedTrigger = <V>(p: IWriteable<V>) => {
//   const listener = (value: InOut<V>) => {
//     p.push(value);
//   }
//   return listener;
// }

// export type FeedPipesOptions = {
//   close?: `any` | `all` | `never`
// }

// /**
//  * Read values from `sourcePipes` to `destination`.
//  * 
//  * By default closes destination if all sources close.
//  * 
//  * Close policies
//  * - any: if any source pipe closes, destination closes and all other reading stops
//  * - all: destination closes when all source pipes close
//  * - never: close signals are filtered
//  * @param destination 
//  * @param sourcePipes 
//  * @param options 
//  */
// export const feedPipes = <V>(destination: IWriteable<V>, sourcePipes: Array<IReadable<V>>, options: FeedPipesOptions = {}) => {
//   const closePolicy = options.close ?? `all`;
//   sourcePipes = [ ...sourcePipes ];
//   let closedCount = 0;

//   const handleValue = (v: InOut<V>) => {
//     if (Signals.isClosed(v)) {
//       switch (closePolicy) {
//         case `all`: {
//           closedCount++;
//           closeBySource(v[ 2 ]);// Make sure we don't get any more messages from this source
//           if (closedCount >= sourcePipes.length) {
//             // All pipes are closed
//             close();
//           }
//           return;
//         }
//         case `any`: {
//           // If any source pipe has closed, we
//           // ought to as well
//           close();
//           return;
//         }
//         case `never`: {
//           // Ignore upstream pipes closing
//           return;
//         } /** no-op */
//       }
//     }
//     destination.push(v);
//   }

//   const subscriptions = sourcePipes.map(source => source.subscribe(handleValue));

//   const closeBySource = (source: IReadable<V>) => {
//     const sub = subscriptions.find(subscription => subscription.source === source);
//     if (sub === undefined) return;
//     source.unsubscribe(sub);

//   }

//   const close = () => {
//     for (const [ index, source ] of sourcePipes.entries()) {
//       source.unsubscribe(subscriptions[ index ]);
//     }
//     destination.signal({ source: Name_Pipes, type: `closed` });
//   }


// }
