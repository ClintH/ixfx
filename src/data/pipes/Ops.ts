
import type { InOut } from "../Signal.js";
import { Signals } from "../index.js";
import * as From from './From.js';
import type { RxNumberRw, Readable } from "./Types.js";
import { bidi, NullSink } from "./index.js";
import * as Fns from './Functions.js';
import type { MinMaxAvgTotal } from "src/collections/MinMaxAvg.js";
import { intervalToMs, repeat, type Interval } from "../../flow/index.js";

export type OnePipeOp<In, Out> = { _type: `One` } & ((input: Readable<In>) => Readable<Out>);
export type OneToManyOp<In, Out> = { _type: `OneToMany` } & ((input: Readable<In>) => Array<Readable<Out>>);
export type ManyToOneOp<In, Out> = { _type: `ManyToOne` } & ((input: Array<Readable<In>>) => Readable<Out>);

export function isOnePipeOp<In, Out>(v: Op<In, Out>): v is OnePipeOp<In, Out> {
  return (`_type` in v && v._type === `One`)
}

export type Op<In, Out> = OnePipeOp<In, Out> | OneToManyOp<In, Out>;

export type OpFactory<In, Out> = (args: any) => Op<In, Out>;

export type CapOptions = {
  length: number
  keepOpen?: boolean
}

const Names_Cap = `cap` as const;
const Names_Synchronise = `synchronise` as const;

/**
 * Only allow a certain number of items from source through
 * 
 * eg. let through the first five items.
 * 
 * By default, output pipe will close when cap is reached.
 * Signals with no values do not count towards cap, but are sent to output.
 * @param p 
 * @param options 
 * @returns 
 */
export const cap = <V>(options: CapOptions): OnePipeOp<V, V> => {
  let count = 0;
  const length = options.length;
  const keepOpen = options.keepOpen ?? false;

  const run = (upstream: Readable<V>) => {
    const downstream = bidi<V>();
    upstream.setOutlet((value: InOut<V>) => {
      // Stop if we're at the desired length
      if (count >= length) {
        upstream.setOutlet(NullSink);
        if (keepOpen) return;
        downstream.inlet(Signals.close(Names_Cap));
        return;
      }
      // Pass data or signal
      downstream.inlet(value);

      // If it's data, count it
      if (Signals.isValue(value)) {
        count++;
      }
    });
    return downstream;
  }
  run._type = `One` as const;
  return run;
}


/**
 * Passes every value from `p` through `monitorFunction`. 
 * Values continue through
 * to returned output pipe.
 * @param p 
 * @param monitorFunction 
 * @param initialState 
 * @returns 
 */
export const monitor = <V, State>(monitorFunction: (value: InOut<V>, state: State) => State, initialState: State): OnePipeOp<V, V> => {
  const run = (upstream: Readable<V>) => {
    const downstream = bidi<V>();
    let state = initialState;
    upstream.setOutlet(v => {
      state = monitorFunction(v, state);
      downstream.inlet(v);
    });
    return downstream;
  }
  run._type = `One` as const;
  return run;
}

/**
 * Streams values from `p` where `filterPredicate` returns true
 * @param p 
 * @param filterPredicate 
 * @returns 
 */
export const filter = <V>(filterPredicate: (v: V) => boolean): OnePipeOp<V, V> => {
  const run = (upstream: Readable<V>) => {
    const downstream = bidi<V>();
    upstream.setOutlet(value => {
      if (Signals.isValue(value)) {
        // Filter values
        if (filterPredicate(value[ 0 ])) {
          downstream.inlet(value)
        }
      } else {
        // Pass through signals
        downstream.inlet(value);
      }
    });
    return downstream;
  }
  run._type = `One` as const;
  return run;
}

export const transform = <In, Out>(transformer: (v: In) => Out): OnePipeOp<In, Out> => {
  const run = (upstream: Readable<In>) => {
    const downstream = bidi<Out>();
    upstream.setOutlet(value => {
      if (Signals.isValue(value)) {
        downstream.inlet([ transformer(value[ 0 ]), undefined ]);
      } else {
        // Pass through signals
        downstream.inlet([ undefined, value[ 1 ] ]);
      }
    });
    return downstream;
  }
  run._type = `One` as const;
  return run;
}

export type EmitOptions = {
  when: `any` | `emit-signal` | `signal`
  passIfNotHandled?: boolean
}

export const chunk = <In>(size: RxNumberRw | number, returnRemainders = true) => {
  const run: OnePipeOp<In, Array<In>> = (upstream: Readable<In>) => {
    const downstream = bidi<Array<In>>();
    let buffer: Array<In> = [];
    const lengthValue = From.number(size);

    upstream.setOutlet(value => {
      if (Signals.isValue(value)) {
        buffer.push(value[ 0 ]);
        if (buffer.length >= (lengthValue.last() ?? 0)) {
          downstream.inlet([ buffer, undefined ]);
          buffer = [];
        }
      } else {
        // Signal
        if (Signals.isClosed(value) && buffer.length > 0 && returnRemainders) {
          downstream.inlet([ buffer, undefined ]);
        }
        downstream.inlet([ undefined, value[ 1 ] ]);
      }
    });
    return downstream;
  }
  run._type = `One`;
  return run;
}

/**
 * Captures a sliding window of values from the source
 * @param length 
 * @returns 
 */
export const window = <In>(length: RxNumberRw | number) => {
  const run: OnePipeOp<In, Array<In>> = (upstream: Readable<In>) => {
    const downstream = bidi<Array<In>>();
    let buffer: Array<In> = [];
    const lengthValue = From.number(length);

    upstream.setOutlet(value => {
      if (Signals.isValue(value)) {
        buffer.push(value[ 0 ]);
        if (buffer.length > (lengthValue.last() ?? 0)) {
          buffer = buffer.slice(1);
        }
        downstream.inlet([ buffer, undefined ]);
      } else {
        downstream.inlet([ undefined, value[ 1 ] ]);
      }
    });
    return downstream;
  }
  run._type = `One`;
  return run;
}

export const emit = <In, Out>(compute: () => Out, options: EmitOptions): OnePipeOp<In, Out> => {
  const when = options.when;
  const passIfNotHandled = options.passIfNotHandled ?? true;

  const run = (upstream: Readable<In>) => {
    const downstream = bidi<Out>();
    upstream.setOutlet(value => {
      //console.log(`emit ${ JSON.stringify(value) }`);
      switch (when) {
        case `any`: {
          downstream.inlet([ compute(), undefined ]);
          return;
        }
        case `signal`: {
          if (Signals.isSignal(value)) {
            downstream.inlet([ compute(), undefined ]);
            return;
          }
          break;
        }
        case `emit-signal`: {
          if (Signals.isSignal(value) && value[ 1 ].type === `emit`) {
            downstream.inlet([ compute(), undefined ]);
            return;
          }
          break;
        }
      }
      if (passIfNotHandled) {
        downstream.inlet([ value[ 0 ] as Out, value[ 1 ] ]);
      }
    });
    return downstream;
  }
  run._type = `One` as const;
  return run;
}

/**
 * Splits `p` into two pipes. `a` is when `filterPredicate` returns true, `b` is false.
 * @param p 
 * @param filterPredicate 
 * @returns 
 */
export const filterAB = <V>(filterPredicate: (v: V) => boolean): OneToManyOp<V, V> => {
  const run = (upstream: Readable<V>) => {
    const pipeA = bidi<V>();
    const pipeB = bidi<V>();
    upstream.setOutlet(v => {
      if (Signals.isValue(v)) {
        // If it's a value, send it to A or B
        if (filterPredicate(v[ 0 ])) {
          pipeA.inlet(v)
        } else {
          pipeB.inlet(v);
        }
      } else {
        // Pass through signals
        Fns.inlet(v, pipeA, pipeB);
      }
    });
    return [ pipeA, pipeB ];
  }
  run._type = `OneToMany` as const;
  return run;
}

/**
 * All values from `p` are sent to `regularPipe`.
 * If a value matches `filterPredicate`, it is also sent to `seenPipe`.
 * @param p 
 * @param filterPredicate 
 * @returns 
 */
export const filterTap = <V>(filterPredicate: (v: V) => boolean) => {
  const run: OneToManyOp<V, V> = (upstream: Readable<V>) => {
    const seenPipe = bidi<V>();
    const regularPipe = bidi<V>();

    upstream.setOutlet(v => {
      if (Signals.isValue(v) && filterPredicate(v[ 0 ])) {
        seenPipe.inlet(v);
      }
      regularPipe.inlet(v);
    });
    return [ seenPipe, regularPipe ];
  }
  run._type = `OneToMany`
  return run;
}

/**
 * Reduces a pipe of arrays into single values
 * using the `reducer` function.
 * @param reducer 
 * @returns 
 */
export const reduce = <V>(reducer: (inputValues: Array<V>) => V) => {
  const run: OnePipeOp<Array<V>, V> = (upstream: Readable<Array<V>>) => {
    const pipe = bidi<V>();
    upstream.setOutlet(values => {
      if (Signals.isValue(values)) {
        pipe.inlet([ reducer(values[ 0 ]), undefined ]);
      } else {
        pipe.inlet([ undefined, values[ 1 ] ]);
      }
    });
    return pipe;
  }
  run._type = `One`;
  return run;
}

export const minMaxAvgTotal = () => {
  const run: OnePipeOp<number, MinMaxAvgTotal> = (upstream: Readable<number>) => {
    const downstream = bidi<MinMaxAvgTotal>();
    let min = Number.MAX_SAFE_INTEGER;
    let max = Number.MIN_SAFE_INTEGER;
    let avg = Number.NaN;
    let total = 0;
    let count = 1;

    upstream.setOutlet(v => {
      if (Signals.isValue(v)) {
        const value = v[ 0 ];
        if (value > max) max = value;
        if (value < min) min = value;
        total += value;
        count++;
        avg = total / count;
        downstream.inlet([ { min, max, avg, total }, undefined ]);
      } else {
        // Pass signal
        downstream.inlet([ undefined, v[ 1 ] ]);
      }
    });
    return downstream;
  }
  run._type = `One` as const;
  return run;
}

export type SplitOptions = {
  copies?: number
  filterSignals?: boolean
}

/**
 * Splits output of `source` into n number of streams. By default two
 * copies are made, thus splitting
 * 
 * Each output of `source` is copied to destination stream(s).
 * 
 * If `numberCopies` is 1, the source pipe is returned.
 * 
 * Options:
 * - filterSignals: If true, does not pass signals through to split pipes. Default: false
 * @param source 
 * @returns 
 */
export const split = <V>(options: SplitOptions = {}) => {
  const numberOfCopies = options.copies ?? 2;
  const filterSignals = options.filterSignals ?? false;

  const run: OneToManyOp<V, V> = (upstream: Readable<V>) => {
    const copies = [ ...repeat(numberOfCopies, () => bidi<V>()) ];

    const split = (v: InOut<V>) => {
      if (filterSignals && Signals.isSignal(v)) return;
      Fns.inlet(v, ...copies);
    }

    upstream.setOutlet(split);
    return copies;
  }
  run._type = `OneToMany`;
  return run;
}

export type SynchroniseOptions = {
  overwritePolicy?: `latest` | `first`
  /**
   * If true (default), will keep reset and wait for the next set of synchronised results
   * If false, will exit after first batch
   */
  loop?: boolean
}

/**
 * Waits for each pipe to emit a value, sending the combined outcome
 * as an array.
 * 
 * By default:
 * - returns the latest values from each stream
 * - after all pipes have emitted a value, loops waiting for the next batch
 * 
 * @param p 
 */
export const synchronise = <V>(opts: SynchroniseOptions) => {
  const overwritePolicy = opts.overwritePolicy ?? `latest`;
  const loop = opts.loop ?? true;

  const run: ManyToOneOp<V, Array<V>> = (upstreams: Array<Readable<V>>) => {
    let results: Array<V | undefined> = [];
    const downstream = bidi<Array<V>>();

    const resetValues = () => {
      results = [];
      for (const [ index ] of upstreams.entries()) {
        results[ index ] = undefined;

      }
    }

    const checkCompletion = () => {
      // Still something missing?
      if (results.includes(undefined)) return;

      // Everything is in place!
      downstream.inlet([ results as Array<V>, undefined ]);
      if (loop) {
        resetValues();
      } else {
        dispose();
      }
    }

    const dispose = () => {
      for (const p of upstreams) {
        p.setOutlet(NullSink);
      }
      downstream.inlet(Signals.close(Names_Synchronise));
    }

    resetValues();

    for (const [ index, upstream ] of upstreams.entries()) {
      upstream.setOutlet(inOut => {
        if (!Signals.isValue(inOut)) return;
        const value = inOut[ 0 ];
        switch (overwritePolicy) {
          case `first`: {
            if (results[ index ] !== undefined) {
              results[ index ] = value;
            }
            break;
          }
          case `latest`: {
            results[ index ] = value;
          }
        }
        checkCompletion();
      });
    }
    return downstream;
  }
  run._type = `ManyToOne`;
  return run;
}

export const throttle = <In>(rate: Interval) => {
  const rateMs = intervalToMs(rate, 0);
  const run: OnePipeOp<In, In> = (upstream: Readable<In>) => {
    const downstream = bidi<In>();
    let lastFire = 0;
    let timer: any = 0;
    let latestValue: In | undefined;

    const trigger = () => {
      const elapsed = performance.now() - lastFire;
      // Long enough time since last triggered
      if (elapsed > rateMs) {
        lastFire = performance.now();
        if (latestValue !== undefined) {
          downstream.inlet([ latestValue, undefined ]);
        }
        clearTimeout(timer);
        return;
      }

      // Otherwise, schedule to trigger in future
      clearTimeout(timer);
      timer = setTimeout(trigger, rateMs - elapsed);
    }

    upstream.setOutlet(value => {
      if (Signals.isValue(value)) {
        latestValue = value[ 0 ];
        trigger();
      } else {
        downstream.inlet(value);
      }

    });

    return downstream
  }
  run._type = `One`;
  return run;
}

export type MergeValuesOptions = {
  allowUndefinedValues?: boolean
}

/**
 * A change in any of the inputs produces a new input
 * @param pipes 
 * @returns 
 */
export const mergeValues = <In, Out>(merger: (...values: Array<In | undefined>) => Out, opts: MergeValuesOptions,) => {
  const run: ManyToOneOp<In, Out> = (pipes: Array<Readable<In>>) => {
    const pipe = bidi<Out>();
    const values: Array<In | undefined> = [];
    const allowUndefinedValues = opts.allowUndefinedValues ?? false;
    let undefinedExists = true;

    const compute = () => {
      if (undefinedExists) {
        // eslint-disable-next-line unicorn/no-lonely-if
        if (!values.includes(undefined)) {
          undefinedExists = false;
        }
      }
      if (!allowUndefinedValues && undefinedExists) return;

      const mergedValue = merger(...values);
      pipe.inlet([ mergedValue, undefined ]);
    }

    for (const [ index ] of pipes.entries()) {
      values[ index ] = undefined;
    }

    for (const [ index, pipe ] of pipes.entries()) {
      // Gather values together in array when they change
      pipe.setOutlet(v => {
        if (Signals.isValue(v)) {
          values[ index ] = v[ 0 ];
          compute();
        }
      });
    }

    return pipe;
  }
  run._type = `ManyToOne`;
  return run;
}