import type { PartialBy } from "@ixfx/core";
import type { IndexWrapLogic } from "./index-wrap.js";
import { clampIndex } from "./clamp.js";
import { indexWrap } from "./index-wrap.js";
import { randomChanceInteger } from "./util/random.js";

export type StepState = {
  index: number;
  incrementing: boolean;
  done: boolean;
};

export type StepContext = {
  startIndex: number;
  endIndex: number;
};

export type StepArrayContext<T> = {
  data: T[] | readonly T[];
  startIndex: number;
  endIndex: number;
  randomSource: () => number;
};

export type StepLoopLogic = `none` | `pingpong`;

export type StepOptions = {
  /**
   * Number of steps to take each time
   */
  steps: number;
  /**
   * What to do if limit is reached
   */
  loop: StepLoopLogic;
  /**
   * If _true_ increments indexes
   */
  forward: boolean;
  /**
   * Every time a step is taken, we flip the direction if the random number is less this value.
   * Thus, a value of 0 means no random changes. A value of 1 means direction will change every time.
   *
   * This can create a 'drunken walk' style of traversal.
   */
  randomDirectionFlip: number;
  /**
   * If set to 0, does not use a random step length.
   * Otherwise, this sets the chance of calculating a random step length.
   * Eg. if the value is 0.1, 10% of the steps will use a random length.
   * Eg. if the value is 1 every step will generate a random length.
   *
   */
  randomChanceSteps: number;
  /**
   * The upper bound of random step length. Needs 'randomChanceSteps' to be set to a value greater than 0 to have an effect.
   *
   * The range of random steps will thus be between 'steps' and this value.
   */
  randomStepsMax: number;
  repeatLoopedIndex: boolean;
  debug?: boolean;
};

/**
 * Given an input step state, take a step and return the new state.
 * This is a lower-level function, you probably want to use {@link arrayIndexStepper} instead.
 * @param state Current step state
 * @param options How to step
 * @param context Context in which we are stepping
 * @returns New step state
 */
export function step(state: PartialBy<StepState, `done`>, options: StepOptions, context: StepContext): StepState {
  if (context.startIndex > context.endIndex)
    throw new TypeError(`startIndex must be less than or equal to endIndex. startIndex: ${context.startIndex} endIndex: ${context.endIndex}`);
  if (context.startIndex === context.endIndex)
    throw new TypeError(`startIndex cannot be the same as endIndex (${context.startIndex}).`);

  let incrementing = state.incrementing;
  const delta = incrementing ? options.steps : -options.steps;
  let index = state.index + delta;
  let done = false;
  const wrapLogic: IndexWrapLogic = options.loop === `none` ? `brickwall` : `bounce`;
  const debug = options.debug ?? false;
  if (debug)
    console.log(`Step: index: ${state.index} incrementing: ${state.incrementing} delta: ${delta} index after step: ${index} start: ${context.startIndex} end: ${context.endIndex} loop: ${options.loop}`);
  const r = indexWrap(index, context.startIndex, context.endIndex, wrapLogic);
  index = r.index;
  if (r.iterations > 0) {
    if (r.iterations % 2 === 1) {
      incrementing = !state.incrementing;
    }
  }
  if (options.loop === `none` && (index === context.endIndex || index === context.startIndex)) {
    done = true;
  }
  return { index, incrementing, done };
}

/**
 * Creates a generator to step through array indices.
 *
 * Supports moving forward/backward through an array, looping, 'drunken walk', and random step lengths.
 *
 * ```js
 * const data [ `a`, `b`, `c`, `d`, `e` ];
 *
 * // Step one by one through each index
 * for (const index of arrayIndexStepper({step:1, loop:`none`}, data)) {
 *  console.log(`index: ${index} value: ${data[index]}`);
 * }
 * ```
 *
 * More examples:
 * ```js
 * // A generator that never ends, going back and forth between start and end
 * arrayIndexStepper({ steps: 1, loop: `pingpong` }, data);
 * // As above, but when we hit the end/start, repeat that index
 * arrayIndexStepper({ steps: 1, loop: `pingpong`, repeatLoopedIndex:true }, data);
 *
 * // Move backwards. from the end, through the indicies, jumping by two
 * arrayIndexStepper({ steps: 2, forward:false }, data);
 *
 * ```
 * @param optionsP
 * @param context
 * @returns Iterator over array indicies
 */
export function arrayIndexStepper<T>(optionsP: Partial<StepOptions>, context: Partial<StepArrayContext<T>> & { data: T[] | readonly T[] }): () => Generator<number> {
  const options: StepOptions = {
    steps: 1,
    loop: `none`,
    repeatLoopedIndex: false,
    debug: false,
    forward: true,
    randomDirectionFlip: 0,
    randomChanceSteps: 0,
    randomStepsMax: 2,
    ...optionsP,
  };
  const range: StepArrayContext<T> = {
    startIndex: 0,
    endIndex: context.data.length - 1,
    randomSource: Math.random,
    ...context,
  };

  const fn = function *(overrideOptions: Partial<StepOptions> = {}, overrideContext: Partial<StepArrayContext<T>> = {}): Generator<number> {
    const _options = { ...options, ...overrideOptions };
    const data = overrideContext.data ?? context.data;
    if (!Array.isArray(data))
      throw new TypeError(`Param 'data' must be an array. Got: ${typeof data}`);
    if (data.length === 0)
      return;
    if (data.length === 1) {
      yield 0;
      return;
    }

    const startIndex = clampIndex(overrideContext.startIndex ?? range.startIndex, data);
    const endIndex = clampIndex(overrideContext.endIndex ?? range.endIndex, data);
    if (startIndex === endIndex)
      throw new Error(`startIndex and endIndex cannot be the same. startIndex: ${startIndex} endIndex: ${endIndex}. Data length: ${data.length} Override: ${JSON.stringify(overrideContext)}`);
    const _context: StepContext = { startIndex, endIndex };
    let state: StepState = { index: _options.forward ? startIndex : endIndex, incrementing: _options.forward, done: false };
    let lastIndex = Number.NaN;
    const debug = _options.debug ?? false;
    while (!state.done) {
      yield state.index;
      if (_options.randomDirectionFlip > 0 && range.randomSource() < _options.randomDirectionFlip) {
        state.incrementing = !state.incrementing;
      }
      if (_options.randomChanceSteps > 0) {
        const randomSteps = randomChanceInteger(_options.randomChanceSteps, _options.randomStepsMax, _options.steps, range.randomSource);
        state = step(state, { ..._options, steps: randomSteps }, _context);
      } else {
        state = step(state, _options, _context);
      }

      if (debug)
        console.log(`index: ${state.index} state: ${JSON.stringify(state)}`);
      if (state.done && state.index !== lastIndex) {
        yield state.index;
      }
      if (_options.repeatLoopedIndex && _options.loop !== `none`) {
        if (state.index === startIndex || state.index === endIndex)
          yield state.index;
      }
      lastIndex = state.index;
    }
  };
  return fn;
}