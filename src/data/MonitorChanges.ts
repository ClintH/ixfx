// import type { RecursiveReplace } from "src/TsUtil.js"
// import { applyChanges, compareData } from "./Pathed.js"

// export type RecordValue<T extends Record<string, any>, TReturn> = {
//   [ Property in keyof T ]?: (value: T[ Property ], previous: T[ Property ], field: string) => TReturn
// }
// export type RecordOptions<T extends Record<string, any>, TReturn> = {
//   onFieldChange: RecordValue<T, TReturn>
// }

// export const compareDataExecute = <T extends Record<string, any>, TReturn>(o: T, options: RecordOptions<T, TReturn>) => {
//   let current = o;

//   const cbs = new Map<string, any>();
//   for (const [ k, v ] of Object.entries(options.onFieldChange)) {
//     cbs.set(k.replaceAll(`_`, `.`), v);
//   }
//   return (value: T): RecursiveReplace<T, TReturn> => {
//     const changes = compareData(current, value, { includeParents: true });
//     //if (changes.length === 0) return; // No change
//     //console.log(`pre`, JSON.stringify(changes));
//     for (const c of changes) {
//       const cb = cbs.get(c.path);
//       if (cb) {
//         c.value = cb(c.value, c.previous, c.path) as TReturn;
//       }
//     }
//     console.log(`post`, JSON.stringify(changes));
//     //current = applyChanges(current, changes);
//     return current;
//   }
// }

// const test = {
//   name: `hello`,
//   age: 10,
//   a: {
//     b: {
//       c: {
//         word: `goat`
//       }
//     }
//   }
// };
// interceptChanges(test, {
//   onFieldChange: {
//     age: (v) => {

//     },
//     a_b_c: (v)
//   }
// })