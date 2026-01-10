import * as Execute from '../execute.js';
import { type DriverOptions, type DriverResult, type DriverRunner, type DriverStatesHandler, type Machine, type MachineState, type StateNames, type Transitions } from './types.js';
import { defaultComparer } from '@ixfx/core';
import { randomElement } from '@ixfx/arrays';
import * as Debug from '@ixfx/debug';
import { init as machineInit, reset as machineReset, next as machineNext, to as machineTo } from './state-machine-fns.js';



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



// async function run<V extends StateMachine.Transitions>(
//   machine: StateMachine.Machine<V>,
//   handlers: readonly StatesHandler<V>[]
// );


/**
 * Drives a state machine.
 *
 * [Read more on the ixfx Guide](https://ixfx.fun/flow/state-machine/driver/)
 * 
 * Uses a 'handlers' structure to determine when to change
 * state and actions to take.
 * 
 * The structure is a set of logical conditions: if we're in
 * this state, then move to this other state etc.
 * 
 * ```js
 * const handlers = [
 *  {
 *    // If we're in the 'sleeping' state, move to next state
 *    if: 'sleeping',
 *    then: { next: true }
 *  },
 *  {
 *    // If we're in the 'waking' state, randomly either go to 'resting' or 'sleeping' state
 *    if: 'waking',
 *    then: [
 *      () => {
 *        if (Math.random() > 0.5) {
 *          return { next: 'resting' }
 *        } else {
 *          return { next: 'sleeping' }
 *        }
 *      }
 *    ]
 *   }
 * ];
 * ```
 * 
 * Set up the driver, and call `run()` when you want to get
 * the machine to change state or take action:
 * 
 * ```js
 * const driver = await StateMachine.driver(states, handlers);
 * setInterval(async () => {
 *  await driver.run(); // Note use of 'await' again
 * }, 1000);
 * ```
 * 
 * Essentially, the 'handlers' structure gets run through each time `run()`
 * is called.
 * 
 * Defaults to selecting the highest-ranked result to determine
 * what to do next.
 * @param machine
 * @param handlersOrOpts
 * @returns
 */
export async function driver<V extends Transitions>(
  machine: Machine<V> | Transitions,
  handlersOrOpts: readonly DriverStatesHandler<V>[] | DriverOptions<V>
): Promise<DriverRunner<V>> {
  const opts: DriverOptions<V> = Array.isArray(handlersOrOpts)
    ? {
      handlers: handlersOrOpts as readonly DriverStatesHandler<V>[],
    }
    : (handlersOrOpts as DriverOptions<V>);

  const debug = Debug.resolveLogOption(opts.debug, {
    category: `StateMachineDriver`,
  });

  // Index handlers by state, making sure there are not multiple
  // handlers for a given state.
  const byState = new Map<string, DriverStatesHandler<V>>();
  for (const h of opts.handlers) {
    const ifBlock = Array.isArray(h.if) ? h.if : [ h.if ];
    for (const state of ifBlock) {
      if (typeof state !== `string`) {
        throw new TypeError(
          `Expected single or array of strings for the 'if' field. Got: '${ typeof state }'.`
        );
      }

      if (byState.has(state)) {
        throw new Error(
          `Multiple handlers defined for state '${ state
          }'. There should be at most one.`
        );
      }
      byState.set(state, h);
    }
  }

  const runOpts: Execute.RunOpts<DriverResult<V>> = {
    // Rank results by score
    rank: (a, b) => {
      return defaultComparer(a.score ?? 0, b.score ?? 0);
    },
    shuffle: opts.shuffleHandlers ?? false,
  };

  let sm = machineInit(machine);

  // Check that all 'if' states are actually defined on machine
  for (const [ ifState ] of byState) {
    // Check if state is defined
    if (
      typeof sm.machine[ ifState ] === `undefined` &&
      ifState !== `__fallback`
    ) {
      throw new Error(
        `StateMachineDriver handler references a state ('${ ifState }') which is not defined on the machine. Therefore this handler will never run.'`
      );
    }
  }

  const run = async (): Promise<MachineState<V> | undefined> => {
    debug(`Run. State: ${ sm.value }`);
    const state = sm.value;
    let handler = byState.get(state);
    if (handler === undefined) {
      debug(`  No handler for state '${ state }', trying __fallback`);

      // Is there a fallback?
      handler = byState.get(`__fallback`);
    }
    if (handler === undefined) {
      debug(`  No __fallback handler`);
      return;
    }

    // If the `first` option is given, stop executing fns as soon as we get
    // a valid result.
    const runOptionsForHandler =
      handler.resultChoice === `first`
        ? {
          ...runOpts,
          stop: (latest: DriverResult<V> | undefined) => {
            if (!latest) return false;
            if (`reset` in latest) return true;
            if (`next` in latest && latest.next !== undefined) return true;
            return false;
          },
        }
        : runOpts;

    const results = await Execute.run<MachineState<V>, DriverResult<V>>(
      handler.then,
      runOptionsForHandler,
      sm
    );
    debug(
      `  In state '${ sm.value }' results: ${ results.length }. Choice: ${ handler.resultChoice
      }`
    );

    // Apply selection logic
    //eslint-disable-next-line functional/no-let
    let r: DriverResult<V> | undefined;
    switch (handler.resultChoice ?? `highest`) {
      case `highest`: {
        r = results.at(-1);
        break;
      }
      case `first`: {
        r = results[ 0 ]; // Since we break on the first result
        break;
      }
      case `lowest`: {
        r = results.at(0);
        break;
      }
      case `random`: {
        r = randomElement(results);
        break;
      }
      default: {
        throw new Error(
          `Unknown 'resultChoice' option: ${ handler.resultChoice }. Expected highest, first, lowest or random`
        );
      }
    }

    debug(`  Chosen result: ${ JSON.stringify(r) }`);
    // Apply result
    if (r?.reset) {
      sm = machineReset(sm);
    } else if (r && r.next) {
      if (typeof r.next === `boolean`) {
        sm = machineNext(sm);
      } else {
        debug(JSON.stringify(results));
        sm = machineTo(sm, r.next);
      }
    }
    return sm;
  };

  return {
    reset: () => {
      sm = machineReset(sm);
    },
    getValue: () => sm.value,
    run,
    to: (state: StateNames<V>) => {
      sm = machineTo(sm, state);
      return sm;
    },
  };
}
