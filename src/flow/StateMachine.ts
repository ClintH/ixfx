// ✔ UNIT TESTED
import { SimpleEventEmitter } from '../Events.js';
import { isStringArray } from '../Guards.js';
import * as Elapsed from './Elapsed.js';
import type {
  StateMachineEventMap,
  MachineDescription,
  Options,
  StateDriverDescription,
  DriverResult,
  DriverDescription,
  DriverExpression,
} from './StateMachineTypes.js';
export * from './StateMachineTypes.js';

/**
 * State machine.
 *
 * Machine description is a simple object of allowed state(s) from particular states.
 *
 * The following example has five possible states (wakeup, sleep, coffee, breakfast & bike). `Sleep` can only transition to the `wakeup`
 * state, while `wakeup` can transition to either `coffee` or `breakfast`.
 *
 * Use `null` to signify the final state. Multiple states can terminate the machine if desired.
 *
 * ```js
 * const description = {
 *  sleep: 'wakeup',
 *  wakeup: ['coffee', 'breakfast'],
 *  coffee: `bike`,
 *  breakfast: `bike`,
 *  bike: null
 * }
 * ```
 *
 * Create the machine with the starting state (`sleep`):
 *
 * ```js
 * const machine = StateMachine.create(`sleep`, description);
 * ```
 *
 * Change the state by name:
 *
 * ```js
 * machine.state = `wakeup`
 * ```
 *
 * Or request an automatic transition (will use first state if there are several options):
 *
 * ```js
 * machine.next();
 * ```
 *
 * Check status:
 *
 * ```js
 * if (machine.state === `coffee`) ...;
 * ```
 *
 * Or if machine is in its terminal, completed state:
 *
 * ```js
 * if (machine.isDone()) ...
 * ```
 *
 * Listen for state changes
 *
 * ```js
 * machine.addEventListener(`change`, evt => {
 *  const {priorState, newState} = evt;
 *  // State change from priorState -> newState
 * });
 *
 * machine.addEventListener(`stop`, evt => {
 *  // Machine has stropped
 * });
 * ```
 * @export
 * @class StateMachine
 * @extends {SimpleEventEmitter<StateMachineEventMap>}
 */
export class StateMachine extends SimpleEventEmitter<StateMachineEventMap> {
  #state: string;
  #debug: boolean;
  #m: MachineDescription;
  #isDone: boolean;
  #initial: string;
  #changedAt = Elapsed.infinity();

  /**
   * Create a state machine with initial state, description and options
   * @param string initial Initial state
   * @param MachineDescription m Machine description
   * @param Options Options for machine (defaults to `{debug:false}`)
   * @memberof StateMachine
   */
  constructor(
    initial: string,
    m: MachineDescription,
    opts: Options = { debug: false }
  ) {
    super();
    const [isValid, errorMsg] = StateMachine.validate(initial, m);
    if (!isValid) throw new Error(errorMsg);

    this.#initial = initial;
    this.#m = m;
    this.#debug = opts.debug ?? false;
    this.#state = initial;
    this.#isDone = false;
  }

  get states(): readonly string[] {
    return Object.keys(this.#m);
  }

  static validate(
    initial: string,
    m: MachineDescription
  ): readonly [boolean, string] {
    // Check that object is structured properly
    const keys = Object.keys(m);
    const finalStates: string[] = [];
    const seenKeys = new Set();
    const seenVals = new Set();

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      if (seenKeys.has(key)) return [false, `Key ${key} is already used`];
      seenKeys.add(key);

      if (typeof keys[i] !== `string`) {
        return [false, `Key[${i}] is not a string`];
      }
      const val = m[key];
      if (val === undefined) return [false, `Key ${key} value is undefined`];
      if (typeof val === `string`) {
        seenVals.add(val);
        if (val === key) return [false, `Loop present for ${key}`];
      } else if (Array.isArray(val)) {
        if (!isStringArray(val)) {
          return [false, `Key ${key} value is not an array of strings`];
        }
        val.forEach((v) => seenVals.add(v));
        if (val.find((v) => v === key)) {
          return [false, `Loop present for ${key}`];
        }
      } else if (val === null) {
        //eslint-disable-next-line functional/immutable-data
        finalStates.push(key);
      } else {
        return [
          false,
          `Key ${key} has a value that is neither null, string or array`,
        ];
      }
    }

    // Check that all values have a top-level state
    const seenValsArray = Array.from(seenVals);
    const missing = seenValsArray.find((v) => !seenKeys.has(v));
    if (missing) {
      return [
        false,
        `Potential state '${missing}' does not exist as a top-level state`,
      ];
    }
    // Check machine contains intial state
    if (m[initial] === undefined) {
      return [false, `Initial state ${initial} not present`];
    }
    return [true, ``];
  }

  /**
   * Moves to the next state if possible. If multiple states are possible, it will use the first.
   * If machine is finalised, no error is thrown and null is returned.
   *
   * @returns {(string|null)} Returns new state, or null if machine is finalised
   * @memberof StateMachine
   */
  next(): string | null {
    // Get possible transitions for current state
    const r = this.#m[this.#state];
    if (r === null) return null; // At the end

    // If there are multiple options, use the first
    if (Array.isArray(r)) {
      //eslint-disable-next-line functional/immutable-data
      if (typeof r[0] === `string`) this.state = r[0];
      else {
        throw new Error(
          `Error in machine description. Potential state array does not contain strings`
        );
      }
    } else if (typeof r === `string`) {
      //eslint-disable-next-line functional/immutable-data
      this.state = r; // Just one option
    } else {
      throw new Error(
        `Error in machine description. Potential state is neither array nor string`
      );
    }
    return this.state;
  }

  /**
   * Returns true if state machine is in its final state
   *
   * @returns
   * @memberof StateMachine
   */
  get isDone(): boolean {
    return this.#isDone;
  }

  /**
   * Resets machine to initial state
   *
   * @memberof StateMachine
   */
  reset() {
    //eslint-disable-next-line functional/immutable-data
    this.#isDone = false;
    //eslint-disable-next-line functional/immutable-data
    this.#state = this.#initial;
    //eslint-disable-next-line functional/immutable-data
    this.#changedAt = Elapsed.since();
  }

  /**
   * Checks whether a state change is valid.
   *
   * @static
   * @param priorState From state
   * @param newState To state
   * @param description Machine description
   * @returns If valid: [true,''], if invalid: [false, 'Error msg here']
   * @memberof StateMachine
   */
  static isValid(
    priorState: string,
    newState: string,
    description: MachineDescription
  ): readonly [boolean, string] {
    // Does state exist?
    if (description[newState] === undefined) {
      return [false, `Machine cannot change to non-existent state ${newState}`];
    }
    // Is transition allowed?
    const rules = description[priorState];
    if (Array.isArray(rules)) {
      if (!rules.includes(newState)) {
        return [
          false,
          `Machine cannot change '${priorState} -> ${newState}'. Allowed transitions: ${rules.join(
            `, `
          )}`,
        ];
      }
    } else {
      if (newState !== rules && rules !== `*`) {
        return [
          false,
          `Machine cannot '${priorState} -> ${newState}'. Allowed transition: ${rules}`,
        ];
      }
    }
    return [true, `ok`];
  }

  isValid(newState: string): readonly [boolean, string] {
    return StateMachine.isValid(this.state, newState, this.#m);
  }

  /**
   * Gets or sets state. Throws an error if an invalid transition is attempted.
   * Use `StateMachine.isValid` to check validity without changing.
   *
   * If `newState` is the same as current state, the request is ignored silently.
   *
   * @memberof StateMachine
   */
  set state(newState: string) {
    const priorState = this.#state;

    if (newState === priorState) return;

    const [isValid, errorMsg] = StateMachine.isValid(
      priorState,
      newState,
      this.#m
    );

    if (!isValid) throw new Error(errorMsg);

    if (this.#debug) console.log(`StateMachine: ${priorState} -> ${newState}`);

    this.#state = newState;

    const rules = this.#m[newState];
    if (rules === null) {
      this.#isDone = true;
    }
    this.#changedAt = Elapsed.since();

    setTimeout(() => {
      this.fireEvent(`change`, { newState: newState, priorState: priorState });
      if (this.isDone) this.fireEvent(`stop`, { state: newState });
    }, 1);
  }

  get state(): string {
    return this.#state;
  }

  /**
   * Returns timestamp when state was last changed.
   * See also `elapsed`
   */
  get changedAt(): number {
    return this.#changedAt();
  }

  /**
   * Returns milliseconds elapsed since last state change.
   * See also `changedAt`
   */
  get elapsed(): number {
    return this.#changedAt();
  }
}

/**
 * Returns a state machine based on a list of strings. The first string is used as the initial state,
 * the last string is considered the final. To just generate a description, use {@link descriptionFromList}.
 *
 * Changes are unidirectional, in array order. ie, for the list [`a`, `b`, `c`], the changes can be:
 * a -> b -> c -> null (final)
 *
 * Use {@link fromListBidirectional} to have bidirectional state changes.
 *
 * ```js
 * const states = [`one`, `two`, `three`];
 * const sm = StateMachine.fromList(states);
 * ```
 */
export const fromList = (...states: readonly string[]): StateMachine =>
  new StateMachine(states[0], descriptionFromList(...states));

/**
 * Returns a state machine based on a list of strings, where states can change forward and backwards.
 * ie, for the list [`a`, `b`, `c`], the changes can be:
 * a <-> b <-> c
 *
 * Use {@link fromList} for unidirectional state changes.
 * @param states
 * @returns
 */
export const fromListBidirectional = (
  ...states: readonly string[]
): StateMachine =>
  new StateMachine(states[0], bidirectionalDescriptionFromList(...states));

/**
 * Creates a new state machine
 * @param initial Initial state
 * @param m Machine description
 * @param opts Options
 * @returns State machine instance
 */
export const create = (
  initial: string,
  m: MachineDescription,
  opts: Options = { debug: false }
): StateMachine => new StateMachine(initial, m, opts);

/**
 * Drive a state machine. [Demo sketch](https://github.com/ClintH/ixfx-demos/tree/main/flow/statemachine-regions)
 *
 * A description can be provided with functions to invoke for each named state.
 * The driver will invoke the function(s) corresponding to the current state of the machine.
 *
 * In the below example, it assumes a state machine with states 'init', 'one' and 'two'.
 *
 * ```js
 * StateMachine.drive(stateMachine, {
 *   init: () => {
 *     if (state.distances[0] > 0.1) return;
 *     return { state: `one` };
 *  },
 *   one: () => {
 *     if (state.distances[1] > 0.1) return;
 *     return { next: true };
 *   },
 *   two: () => {
 *     if (state.distances[2] > 0.1) return;
 *     return { reset: true };
 *   },
 *   __fallback:() => {
 *     // Handle case when the other handlers return undefined
 *   }
 * }
 * ```
 *
 * Three additional handlers can be defined: '__done', '__default'  and '__fallback'.
 * * '__done': used when there is no explicit handler for state and machine is done
 * * '__default': used if the state has no named handler
 * * '__fallback': used if there is no handler for state, or handler did not return a usable result.
 *
 * Each state can have a single function or array of functions to act as handlers.
 * The handler needs to return {@link DriverResult}. In the above example, you see
 * how to change to a named state (`{state: 'one'}`), how to trigger `sm.next()` and
 * how to reset the state machine.
 *
 * If the function cannot do anything, it can just return.
 *
 * Multiple functions can be provided to handle a particular state, eg:
 * ```js
 * StateMachine.drive(stateMachine, {
 *  init: [
 *    () => { ... },
 *    () => { ... }
 *  ]
 * })
 * ```
 *
 * When multiple functions are provided, by default the first that returns a result
 * and the result can be executed is used.
 *
 * It's also possible to use the highest or lowest scoring result. To do so, results
 * must have a `score` property, as shown below. Extra syntax also has to be provided
 * instead of a bare array of functions. This is how the logic for selecting results can be
 * set.
 *
 * ```js
 * StateMachine.drive(stateMachine, {
 *   init: {
 *    select: `highest`,
 *    expressions: [
 *     () => {
 *      // some logic...
 *      return { score: 0.1, state: `hello` }
 *     },
 *     () => {
 *      // some logic...
 *       return { score: 0.2, state: `goodbye` }
 *     }
 *    ]
 *   }
 * });
 * ```
 *
 * The score results likely should not be hardcoded as in the above example,
 * but rather based on some other dynamic values influencing what action to take.
 *
 * @param sm
 * @param driver
 * @returns
 */
export const drive = <V>(
  //eslint-disable-next-line functional/prefer-immutable-types
  sm: StateMachine,
  driver: StateDriverDescription<V>
) => {
  const defaultSelect = `first`;
  // Normalise driver first
  const d: StateDriverDescriptionNormalised<V> = {};
  for (const key of Object.keys(driver)) {
    const branch = driver[key];
    if (isDriverDescription(branch)) {
      // @ts-ignore
      //eslint-disable-next-line functional/immutable-data
      d[key] = normaliseDriverDescription(branch);
    } else if (Array.isArray(branch)) {
      // @ts-ignore
      //eslint-disable-next-line functional/immutable-data
      d[key] = {
        select: defaultSelect,
        expressions: branch,
        tryAll: true,
      };
    } else {
      // @ts-ignore
      //eslint-disable-next-line functional/immutable-data
      d[key] = {
        select: defaultSelect,
        tryAll: true,
        expressions: [branch as DriverExpression<V>],
      };
    }
  }

  const drive = (r: DriverResult): boolean => {
    try {
      if (typeof r.next !== `undefined` && r.next) {
        sm.next();
      } else if (typeof r.state !== `undefined`) {
        //eslint-disable-next-line functional/immutable-data, @typescript-eslint/no-non-null-assertion
        sm.state = r.state!;
      } else if (typeof r.reset !== `undefined` && r.reset) {
        sm.reset();
      } else {
        throw new Error(
          `Result has neither 'reset', 'next' nor 'state' properties needed to drive state machine`
        );
      }
      return true;
    } catch (ex) {
      console.warn(ex);
      return false;
    }
  };

  const processResultSet = <V>(
    branch: DriverDescriptionNormalised<V>,
    //eslint-disable-next-line functional/prefer-immutable-types
    resultSet: DriverResult[]
  ) => {
    for (const result of resultSet) {
      if (drive(result)) return true;
      if (!branch.tryAll) break;
    }
    return false;
  };

  const processBranch = <V>(
    branch: DriverDescriptionNormalised<V> | null,
    args?: V
  ) => {
    if (!branch) return false;
    //eslint-disable-next-line functional/no-let
    let handled = false;

    switch (branch.select) {
      case `first`:
        for (const expr of branch.expressions) {
          const r = expr(args);
          if (!r) continue;
          if (drive(r)) {
            handled = true;
            break;
          }
        }
        break;
      case `highest`:
        handled = processResultSet(branch, [
          ...sortResults(branch.expressions.map((e) => e(args))),
        ]);
        break;
      case `lowest`:
        handled = processResultSet(
          branch,
          [...sortResults(branch.expressions.map((e) => e(args)))].reverse()
        );
        break;
      default:
        throw new Error(
          `Unknown select type: ${branch.select}. Expected first, highest or lowest`
        );
    }
    return handled;
  };

  const process = (args?: V) => {
    //eslint-disable-next-line functional/no-let
    let branch = d[sm.state];
    if (!branch && sm.isDone) d[`__done`];
    if (!branch) branch = d[`__default`];

    //eslint-disable-next-line functional/no-let
    let handled = processBranch(branch, args);
    if (!handled) {
      branch = d[`__fallback`];
      handled = processBranch(branch, args);
    }
  };
  return process;
};

type DriverDescriptionNormalised<V> = {
  readonly select: `first` | `highest` | `lowest`;
  readonly tryAll: boolean;
  readonly expressions: readonly DriverExpression<V>[];
};

interface StateDriverDescriptionNormalised<V> {
  readonly [key: string]: DriverDescriptionNormalised<V>;
}

const isDriverDescription = <V>(
  v: DriverDescription<V> | readonly DriverExpression<V>[] | DriverExpression<V>
): v is DriverDescription<V> => {
  if (Array.isArray(v)) return false;
  const vv = v as DriverDescription<V>;
  if (typeof vv.expressions !== `undefined`) return true;
  return false;
};

/**
 * Returns a machine description based on a list of strings.
 * The last string is the terminal state:
 *  A -> B -> C -> D
 *
 * ```js
 * const states = [`one`, `two`, `three`];
 * const sm = StateMachine.create(states[0], descriptionFromList(states));
 * ```
 * @param states List of states
 * @return MachineDescription
 */
export const descriptionFromList = (
  ...states: readonly string[]
): MachineDescription => {
  const t = {};
  for (let i = 0; i < states.length; i++) {
    if (i === states.length - 1) {
      /** @ts-ignore */
      //eslint-disable-next-line functional/immutable-data
      t[states[i]] = null;
    } else {
      /** @ts-ignore */
      //eslint-disable-next-line functional/immutable-data
      t[states[i]] = states[i + 1];
    }
  }
  return t;
};

/**
 * Returns a machine description based on a list of strings. Machine
 * can go back and forth between states:
 * A <-> B <-> C <-> D
 * @param states
 * @returns
 */
export const bidirectionalDescriptionFromList = (
  ...states: readonly string[]
): MachineDescription => {
  const t = {};
  for (let i = 0; i < states.length; i++) {
    /** @ts-ignore */
    //eslint-disable-next-line functional/immutable-data
    t[states[i]] = [];
  }

  for (let i = 0; i < states.length; i++) {
    /** @ts-ignore */
    const v = t[states[i]] as string[];
    if (i === states.length - 1) {
      if (states.length > 1) {
        //eslint-disable-next-line functional/immutable-data
        v.push(states[i - 1]);
      } else {
        /** @ts-ignore */
        //eslint-disable-next-line functional/immutable-data
        t[states[i]] = null;
      }
    } else {
      //eslint-disable-next-line functional/immutable-data
      v.push(states[i + 1]);
      //eslint-disable-next-line functional/immutable-data
      if (i > 0) v.push(states[i - 1]);
    }
  }
  return t;
};

const normaliseDriverDescription = <V>(
  d: DriverDescription<V>
): DriverDescriptionNormalised<V> => {
  const select = d.select ?? `first`;
  const expressions = Array.isArray(d.expressions)
    ? d.expressions
    : [d.expressions];
  const n: DriverDescriptionNormalised<V> = {
    select,
    expressions,
    tryAll: d.tryAll ?? true,
  };
  return n;
};

const sortResults = (
  arr: readonly (DriverResult | undefined)[] = []
): readonly DriverResult[] => {
  // Remove undefined
  const a = arr.filter((v) => v !== undefined) as DriverResult[];
  //eslint-disable-next-line functional/immutable-data
  a.sort((a, b) => {
    const aScore = a.score ?? 0;
    const bScore = b.score ?? 0;

    if (aScore === bScore) return 0;
    if (aScore > bScore) return -1;
    return 1;
  });
  return a;
};

// const sortTest:readonly (DriverResult|undefined)[] = [
//   { score: 0.4 },
//   { score: 0 },
//   undefined,
//   { score: 1 },
//   { score: 0.1 }
// ];
// console.log(sortResults(sortTest));
