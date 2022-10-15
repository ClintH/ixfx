// import { Arrays } from "../collections/index.js";
// import { number as guardNumber } from "../Guards.js";

// /**
//  * Returns the similarity of `a` and `b` to each other
//  * @param a 
//  * @param b 
//  */
// export type Similarity<V> =(a:V, b:V)=>number;

// // export type Correlation<V> = {
// //   readonly data:V
// // }

// const compare = (a:Scoring<unknown>, b:Scoring<unknown>) => {
//   if (a === b) return 0;
//   if (a.score > b.score) return 1;
//   else if (a.score < b.score) return -1;
//   return 0;
// };

// export type ValueWithId<V> = {
//   readonly value:V
//   readonly id:string
// };

// export type Scoring<V> = {
//   readonly data:ValueWithId<V>
//   readonly score:number
// }

// export type Results<V> = {
//   readonly value:ValueWithId<V>
//   readonly scores:readonly Scoring<V>[]
//   readonly since:number
// };

// const toValueWithId = <V>(v:V, identityFn:(v:V)=>string):ValueWithId<V> => ({ value: v, id: identityFn(v) });

// export const correlate = <V>(fn:Similarity<V>, prior:readonly ValueWithId<V>[], data:readonly ValueWithId<V>[]):readonly Results<V>[] => {
//   const ret:Results<V>[] = [];
//   const now = Date.now();

//   // If there's no prior data, shortcut
//   if (prior.length === 0) return data.map(d => ({ since:now, value: d, scores: [] }));

//   for (const d of data) {
//     // Calculate score of each new data item to prior items
//     const scorings:Scoring<V>[] = prior.map(priorData => ({  score: fn(d.value, priorData.value), data: d }));

//     //eslint-disable-next-line functional/immutable-data
//     scorings.sort(compare);

//     const result:Results<V> = {
//       value: d,
//       scores: scorings,
//       since: now
//     };

//     //eslint-disable-next-line functional/immutable-data
//     ret.push(result);
//   }
//   return ret;
// };

// export type Opts = {
//   readonly threshold:number
//   readonly expireUnmatchedAfterMs?:number
//   readonly debug?:false
// }

// export const correlator = <V>(fn:Similarity<V>, identityFn:(v:V)=>string, opts:Opts) => {
//   const prior = new Map<string, Results<V>>();
//   const threshold = opts.threshold;
//   const debug = opts.debug ?? false;
//   const expireUnmatchedAfterMs = opts.expireUnmatchedAfterMs ?? 0;
//   guardNumber(threshold, `positive`, `opts.threshold`);
//   guardNumber(expireUnmatchedAfterMs, ``, `opts.expireUnmatchedAfterMs`);

//   const onNewData = (v:Results<V>, reason:string) => {
//     prior.set(v.value.id, v);
//     if (debug) {
//       console.log(`correlator.onNewData ${reason} id: ${v.value.id}`);
//     }
//   };

//   const onUpdateData = (v:Results<V>, score:Scoring<V>, reason:string) => {
//     prior.set(v.value.id, v);
//     if (debug) {
//       console.log(`correlator.onUpdateData ${reason} id: ${v.value.id}`);
//     }
//   };

//   const onRemovedData = (v:Results<V>, reason:string) => {
//     prior.delete(v.value.id);
//     if (debug) {
//       console.log(`correlator.onRemovedData ${reason} id: ${v.value.id}`);
//     }
//   };
  
//   const compute = (data:V[]) => {
//     const values:ValueWithId<V>[] = [];
//     const expiry = Date.now() - expireUnmatchedAfterMs;
//     for (const [, v] of prior) {
//       if (v.since < expiry) {
//         //eslint-disable-next-line functional/immutable-data
//         values.push(v.value);
//       } else {
//         onRemovedData(v, `expired`);
//       }
//     }

//     // Assign ids to each received data, just in case we need them
//     const dataWithId = data.map(d => toValueWithId(d, identityFn));

//     // Compare prior values to new values
//     const results = correlate(fn, values, dataWithId);

//     // For all of the new data we get, figure out what to do with it
//     results.forEach(s => {
//       if (s.scores.length === 0) {
//         // No prior data. This can be on the first run when
//         // there are no comparison data
//         onNewData(s, `no prior`);
//         return;
//       }

//       // Grab top associated result(s)
//       const filteredScores = Arrays.until<Scoring<V>, number>(s.scores, (score, acc) => {
//         if (Math.abs(score.score / (score.score - acc)) > 0.1) return [true, score.score];
//         return [
//           false, score.score
//         ];
//       }, 0);

//       // If the top scoring match isn't great, consider it a new thing to track
//       if (s.scores[0].score < threshold) {
//         onNewData(s, `no good match`); 
//         return;
//       }

//       // Update existing
//       onUpdateData(s, filteredScores, `update`);

//     });

//   };
  
//   return compute;
// };