// export type StateHandlerResult = {
//   /**
//    * Score of this result. This is used when a state
//    * has multiple handlers returning results separately.
//    */
//   readonly score?: number;
//   /**
//    * If specified, the state to transition to.
//    * This field is 2nd priority.
//    */
//   readonly state?: string;
//   /**
//    * If true, triggers next available state.
//    * This flag is 1st priority.
//    */
//   readonly next?: boolean;
//   /**
//    * If true, resets the machine.
//    * This flag is 3rd priority.
//    */
//   readonly reset?: boolean;
// };
// export type DriverExpression<V> = (args?: V) => StateHandlerResult | undefined;

// type DriverDescriptionNormalised<V> = {
//   readonly select: `first` | `highest` | `lowest`;
//   readonly tryAll: boolean;
//   readonly expressions: readonly DriverExpression<V>[];
// };

// interface StateDriverDescriptionNormalised<V> {
//   readonly [key: string]: DriverDescriptionNormalised<V>;
// }

// /**
//  * Drive a state machine. [Demo sketch](https://github.com/ClintH/ixfx-demos/tree/main/flow/statemachine-regions)
//  *
//  * A description can be provided with functions to invoke for each named state.
//  * The driver will invoke the function(s) corresponding to the current state of the machine.
//  *
//  * In the below example, it assumes a state machine with states 'init', 'one' and 'two'.
//  *
//  * ```js
//  * StateMachine.drive(stateMachine, {
//  *    // Run when state is 'init'
//  *   init: () => {
//  *     if (distances[0] > 0.1) return;
//  *     // Change to state 'one' when distance is under 0.1
//  *     return { state: `one` };
//  *   },
//  *   // Run when state is 'one'
//  *   one: () => {
//  *     if (distances[1] > 0.1) return;
//  *     // Go to next state when distance is under 0.1
//  *     return { next: true };
//  *   },
//  *   // Run when state is 'two'
//  *   two: () => {
//  *     if (distances[2] > 0.1) return;
//  *     // Reset state machine if distance is under 0.1
//  *     return { reset: true };
//  *   }
//  * }
//  * ```
//  *
//  * Three additional handlers can be defined: '__done', '__default'  and '__fallback'.
//  * * '__done': used when there is no explicit handler for state and machine is done
//  * * '__default': used if the state has no named handler
//  * * '__fallback': used if there is no handler for state, or handler did not return a usable result.
//  *
//  * Each state can have a single function or array of functions to act as handlers.
//  * The handler needs to return {@link StateHandlerResult}. In the above example, you see
//  * how to change to a named state (`{state: 'one'}`), how to trigger `sm.next()` and
//  * how to reset the state machine.
//  *
//  * If the function cannot do anything, it can just return.
//  *
//  * Multiple functions can be provided to handle a particular state, eg:
//  * ```js
//  * StateMachine.drive(stateMachine, {
//  *  init: [
//  *    () => { ... },
//  *    () => { ... }
//  *  ]
//  * })
//  * ```
//  *
//  * When multiple functions are provided, by default the first that returns a result
//  * and the result can be executed is used.
//  *
//  * It's also possible to use the highest or lowest scoring result. To do so, results
//  * must have a `score` property, as shown below. Extra syntax also has to be provided
//  * instead of a bare array of functions. This is how the logic for selecting results can be
//  * set.
//  *
//  * ```js
//  * StateMachine.drive(stateMachine, {
//  *   init: {
//  *    select: `highest`,
//  *    expressions: [
//  *     () => {
//  *      // some logic...
//  *      return { score: 0.1, state: `hello` }
//  *     },
//  *     () => {
//  *      // some logic...
//  *       return { score: 0.2, state: `goodbye` }
//  *     }
//  *    ]
//  *   }
//  * });
//  * ```
//  *
//  * The score results likely should not be hardcoded as in the above example,
//  * but rather based on some other dynamic values influencing what action to take.
//  *
//  * @param sm
//  * @param driver
//  * @returns
//  */
// export const drive = <V>(
//   //eslint-disable-next-line functional/prefer-immutable-types
//   sm: StateMachine,
//   driver: StateDriverDescription<V>
// ) => {
//   const defaultSelect = `first`;
//   // Normalise driver first
//   const d: StateDriverDescriptionNormalised<V> = {};
//   for (const key of Object.keys(driver)) {
//     const branch = driver[key];
//     if (isDriverDescription(branch)) {
//       // @ts-ignore
//       //eslint-disable-next-line functional/immutable-data
//       d[key] = normaliseDriverDescription(branch);
//     } else if (Array.isArray(branch)) {
//       // @ts-ignore
//       //eslint-disable-next-line functional/immutable-data
//       d[key] = {
//         select: defaultSelect,
//         expressions: branch,
//         tryAll: true,
//       };
//     } else {
//       // @ts-ignore
//       //eslint-disable-next-line functional/immutable-data
//       d[key] = {
//         select: defaultSelect,
//         tryAll: true,
//         expressions: [branch as DriverExpression<V>],
//       };
//     }
//   }

//   const drive = (r: StateHandlerResult): boolean => {
//     try {
//       if (typeof r.next !== `undefined` && r.next) {
//         sm.next();
//       } else if (typeof r.state !== `undefined`) {
//         //eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-non-null-assertion
//         sm.state = r.state!;
//       } else if (typeof r.reset !== `undefined` && r.reset) {
//         sm.reset();
//       } else {
//         throw new Error(
//           `Result has neither 'reset', 'next' nor 'state' properties needed to drive state machine`
//         );
//       }
//       return true;
//     } catch (ex) {
//       console.warn(ex);
//       return false;
//     }
//   };

//   const processResultSet = <V>(
//     branch: DriverDescriptionNormalised<V>,
//     //eslint-disable-next-line functional/prefer-immutable-types
//     resultSet: StateHandlerResult[]
//   ) => {
//     for (const result of resultSet) {
//       if (drive(result)) return true;
//       if (!branch.tryAll) break;
//     }
//     return false;
//   };

//   const processBranch = <V>(
//     branch: DriverDescriptionNormalised<V> | null,
//     args?: V
//   ) => {
//     if (!branch) return false;
//     //eslint-disable-next-line functional/no-let
//     let handled = false;

//     switch (branch.select) {
//       case `first`:
//         for (const expr of branch.expressions) {
//           const r = expr(args);
//           if (!r) continue;
//           if (drive(r)) {
//             handled = true;
//             break;
//           }
//         }
//         break;
//       case `highest`:
//         handled = processResultSet(branch, [
//           ...sortResults(branch.expressions.map((e) => e(args))),
//         ]);
//         break;
//       case `lowest`:
//         handled = processResultSet(
//           branch,
//           [...sortResults(branch.expressions.map((e) => e(args)))].reverse()
//         );
//         break;
//       default:
//         throw new Error(
//           `Unknown select type: ${branch.select}. Expected first, highest or lowest`
//         );
//     }
//     return handled;
//   };

//   const process = (args?: V) => {
//     //eslint-disable-next-line functional/no-let
//     let branch = d[sm.state];
//     if (!branch && sm.isDone) d[`__done`];
//     if (!branch) branch = d[`__default`];

//     //eslint-disable-next-line functional/no-let
//     let handled = processBranch(branch, args);
//     if (!handled) {
//       branch = d[`__fallback`];
//       handled = processBranch(branch, args);
//     }
//   };
//   return process;
// };

// const isDriverDescription = <V>(
//   v: DriverDescription<V> | readonly DriverExpression<V>[] | DriverExpression<V>
// ): v is DriverDescription<V> => {
//   if (Array.isArray(v)) return false;
//   const vv = v as DriverDescription<V>;
//   if (typeof vv.expressions !== `undefined`) return true;
//   return false;
// };

// const normaliseDriverDescription = <V>(
//   d: DriverDescription<V>
// ): DriverDescriptionNormalised<V> => {
//   const select = d.select ?? `first`;
//   const expressions = Array.isArray(d.expressions)
//     ? d.expressions
//     : [d.expressions];
//   const n: DriverDescriptionNormalised<V> = {
//     select,
//     expressions,
//     tryAll: d.tryAll ?? true,
//   };
//   return n;
// };

// /**
//  * Sort state handler results by score. Undefined results are ignored.
//  * @param arr Results to sort
//  * @returns Sorted copy of input array
//  */
// const sortResults = (
//   arr: readonly (StateHandlerResult | undefined)[] = []
// ): readonly StateHandlerResult[] => {
//   // Remove undefined
//   const a = arr.filter((v) => v !== undefined) as StateHandlerResult[];
//   //eslint-disable-next-line functional/immutable-data
//   a.sort((a, b) => {
//     const aScore = a.score ?? 0;
//     const bScore = b.score ?? 0;

//     if (aScore === bScore) return 0;
//     if (aScore > bScore) return -1;
//     return 1;
//   });
//   return a;
// };
