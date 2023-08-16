import * as StateMachine from './StateMachine.js';
import * as Execute from './Execute.js';
import { type MachineState } from './StateMachine.js';
import { defaultComparer } from '../Util.js';
import { randomElement } from '../collections/Arrays.js';
import { resolveLogOption, type LogOption } from '../Debug.js';

export type Result<V extends StateMachine.Transitions> = {
  /**
   * Score of this result. This is used when a state
   * has multiple handlers returning results separately.
   * If not defined, 0 is used.
   */
  readonly score?: number;

  //readonly state?: StateMachine.StateNames<V>;
  /**
   * If specified,the state to transition to. Use
   * _true_ to attempt to automatically advance machine.
   * This field is 2nd priority.
   */
  readonly next?: StateMachine.StateNames<V> | boolean;
  /**
   * If true, resets the machine.
   * This flag is 1st priority, taking precedence over the `next` field.
   */
  readonly reset?: boolean;
};

//eslint-disable-next-line functional/no-mixed-types
export type Runner<V extends StateMachine.Transitions> = {
  readonly run: () => Promise<StateMachine.MachineState<V> | boolean>;
  readonly getValue: () => StateMachine.StateNames<V>;
  readonly to: (
    state: StateMachine.StateNames<V>
  ) => StateMachine.MachineState<V>;
};

// export type Expression<Transitions extends StateMachine.Transitions> =
//   Execute.Expression<Transitions, Result<Transitions>> &
//     ((
//       machine: StateMachine.MachineState<Transitions>
//     ) => Result<Transitions> | undefined);

export type StatesHandler<V extends StateMachine.Transitions> = {
  readonly if:
    | readonly StateMachine.StateNames<V>[]
    //eslint-disable-next-line functional/prefer-readonly-type
    | StateMachine.StateNames<V>[]
    | StateMachine.StateNames<V>;
  readonly then: readonly ExpressionOrResult<V>[] | ExpressionOrResult<V>;
  /**
   * Logic for choosing which result, if there are multiple expressions.
   * By default 'highest' (for highest ranked result)
   */
  readonly resultChoice?: `first` | `highest` | `lowest` | `random`;
};

// export type Prerequisite<V extends StateMachine.Transitions> =
//   | readonly StateMachine.StateNames<V>[]
//   | ((
//       potentialState: StateMachine.StateNames<V>,
//       state: StateMachine.MachineState<V>
//     ) => boolean);

// export type StatePrerequisites<V extends StateMachine.Transitions> = {
//   readonly states:
//     | readonly StateMachine.StateNames<V>[]
//     | StateMachine.StateNames<V>;
//   readonly condition?: Prerequisite<V>;
// };

export type DriverOpts<V extends StateMachine.Transitions> = {
  readonly handlers: readonly StatesHandler<V>[];
  //readonly prereqs?: StatePrerequisites<V>;
  readonly debug?: LogOption;
  /**
   * If _true_ execution of handlers is shuffled each time
   */
  readonly shuffleHandlers?: boolean;
};

// async function run<V extends StateMachine.Transitions>(
//   machine: StateMachine.Machine<V>,
//   handlers: readonly StatesHandler<V>[]
// );

export type ExpressionOrResult<Transitions extends StateMachine.Transitions> =
  | Result<Transitions>
  | ((machine?: MachineState<Transitions>) => Result<Transitions> | undefined);

/**
 * Drive `machine`.
 *
 * Defaults to selecting the highest-ranked result to determine
 * what to do next.
 * @param machine
 * @param handlersOrOpts
 * @returns
 */
export async function init<V extends StateMachine.Transitions>(
  machine: StateMachine.Machine<V> | StateMachine.Transitions,
  handlersOrOpts: readonly StatesHandler<V>[] | DriverOpts<V>
): Promise<Runner<V>> {
  const opts: DriverOpts<V> = Array.isArray(handlersOrOpts)
    ? {
        handlers: handlersOrOpts as readonly StatesHandler<V>[],
      }
    : (handlersOrOpts as DriverOpts<V>);

  const debug = resolveLogOption(opts.debug, {
    category: 'StateMachineDriver',
  });

  // Index handlers by state, making sure there are not multiple
  // handlers for a given state.
  const byState = new Map<string, StatesHandler<V>>();
  for (const h of opts.handlers) {
    const ifBlock = Array.isArray(h.if) ? h.if : [h.if];
    ifBlock.forEach((state) => {
      if (typeof state !== 'string') {
        throw new Error(
          `Expected single or array of strings for the 'if' field. Got: '${typeof state}'.`
        );
      }

      if (byState.has(state as string)) {
        throw new Error(
          `Multiple handlers defined for state '${
            state as string
          }'. There should be at most one.`
        );
      }
      byState.set(state as string, h);
    });
  }

  // const expressions: Expression<V>[] = [
  //   (_machine) => {
  //     const r: Result<V> = {
  //       next: 'hello',
  //     };
  //     return r;
  //   },
  // ];

  const runOpts: Execute.RunOpts<Result<V>> = {
    // Rank results by score
    rank: (a, b) => {
      return defaultComparer(a.score ?? 0, b.score ?? 0);
    },
    shuffle: opts.shuffleHandlers ?? false,
  };

  //eslint-disable-next-line functional/no-let
  let sm = StateMachine.init(machine);

  // Check that all 'if' states are actually defined on machine
  for (const [ifState] of byState) {
    // Check if state is defined
    if (
      typeof sm.machine[ifState] === `undefined` &&
      ifState !== '__fallback'
    ) {
      throw new Error(
        `StateMachineDriver handler references a state ('${ifState}') which is not defined on the machine. Therefore this handler will never run.'`
      );
    }
  }

  const run = async (): Promise<StateMachine.MachineState<V> | boolean> => {
    debug(`Run. State: ${sm.value as string}`);
    const state = sm.value as string;
    //eslint-disable-next-line functional/no-let
    let handler = byState.get(state);
    if (handler === undefined) {
      debug(`  No handler for state '${state}', trying __fallback`);

      // Is there a fallback?
      handler = byState.get('__fallback');
    }
    if (handler === undefined) {
      debug(`  No __fallback handler`);
      return false;
    }

    // If the `first` option is given, stop executing fns as soon as we get
    // a valid result.
    const runOptsForHandler =
      handler.resultChoice === `first`
        ? {
            ...runOpts,
            stop: (latest: Result<V> | undefined) => {
              if (!latest) return false;
              if (`reset` in latest) return true;
              if (`next` in latest) {
                if (latest.next !== undefined) return true;
              }
              return false;
            },
          }
        : runOpts;

    const results = await Execute.run<MachineState<V>, Result<V>>(
      handler.then,
      runOptsForHandler,
      sm
    );
    debug(
      `  In state '${sm.value as string}' results: ${results.length}. Choice: ${
        handler.resultChoice
      }`
    );

    // Apply selection logic
    //eslint-disable-next-line functional/no-let
    let r: Result<V> | undefined;
    switch (handler.resultChoice ?? 'highest') {
      case 'highest':
        r = results.at(-1);
        break;
      case 'first':
        r = results[0]; // Since we break on the first result
        break;
      case 'lowest':
        r = results.at(0);
        break;
      case 'random':
        r = randomElement(results);
        break;
      default:
        throw new Error(
          `Unknown 'resultChoice' option: ${handler.resultChoice}. Expected highest, first, lowest or random`
        );
    }

    debug(`  Chosen result: ${JSON.stringify(r)}`);
    // Apply result
    if (r && r.reset) {
      sm = StateMachine.reset(sm);
    } else if (r && r.next) {
      if (typeof r.next === 'boolean') {
        sm = StateMachine.next(sm);
      } else {
        debug(JSON.stringify(results));
        sm = StateMachine.to(sm, r.next);
      }
    }
    return sm;
  };

  return {
    getValue: () => sm.value,
    run,
    to: (state: StateMachine.StateNames<V>) => {
      sm = StateMachine.to(sm, state);
      return sm;
    },
  };
}
