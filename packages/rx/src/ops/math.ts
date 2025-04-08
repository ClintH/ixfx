import { initUpstream } from "../init-stream.js";
import { toReadable } from "../to-readable.js";
import type { Reactive, ReactiveOrSource } from "../types.js";
import * as Proc from '@ixfxfun/core/process';
import type { OpAsAnnotation, OpMathOptions } from "./types.js";
import type { RankFunction, RankOptions } from "@ixfxfun/core";

export function max(input: ReactiveOrSource<any>, options: OpMathOptions): Reactive<number>;
export function max(input: ReactiveOrSource<any>, options: OpAsAnnotation & OpMathOptions): Reactive<{ value: number, max: number }>;
export function max(input: ReactiveOrSource<any>, options: OpMathOptions): Reactive<number> | Reactive<{ value: number, max: number }> {
  const p = Proc.max();
  return process(p, `max`, input, options);
}

export function min(input: ReactiveOrSource<any>, options: OpMathOptions): Reactive<number>;
export function min(input: ReactiveOrSource<any>, options: OpAsAnnotation & OpMathOptions): Reactive<{ value: number, min: number }>;
export function min(input: ReactiveOrSource<any>, options: OpMathOptions): Reactive<number> | Reactive<{ value: number, min: number }> {
  const p = Proc.min();
  return process(p, `min`, input, options);
}

export function average(input: ReactiveOrSource<any>, options: OpMathOptions): Reactive<number>;
export function average(input: ReactiveOrSource<any>, options: OpAsAnnotation & OpMathOptions): Reactive<{ value: number, average: number }>;
export function average(input: ReactiveOrSource<any>, options: OpMathOptions): Reactive<number> | Reactive<{ value: number, average: number }> {
  const p = Proc.average();
  return process(p, `average`, input, options);
}

export function sum(input: ReactiveOrSource<any>, options: OpMathOptions): Reactive<number>;
export function sum(input: ReactiveOrSource<any>, options: OpAsAnnotation & OpMathOptions): Reactive<{ value: number, sum: number }>;
export function sum(input: ReactiveOrSource<any>, options: OpMathOptions): Reactive<number> | Reactive<{ value: number, sum: number }> {
  const p = Proc.sum();
  return process(p, `sum`, input, options);
}

export type TallyOptions = OpMathOptions & {
  countArrayItems: boolean
}

export function tally(input: ReactiveOrSource<any>, options: Partial<TallyOptions>): Reactive<number>;
export function tally<TIn>(input: ReactiveOrSource<TIn>, options: OpAsAnnotation & Partial<TallyOptions>): Reactive<{ value: TIn, tally: number }>;
export function tally<TIn>(input: ReactiveOrSource<TIn>, options: Partial<TallyOptions> = {}): Reactive<number> | Reactive<{ value: TIn, tally: number }> {
  const countArrayItems = options.countArrayItems ?? true;
  const p = Proc.tally(countArrayItems);
  return process(p, `tally`, input, options);
}

export function rank<TIn>(input: ReactiveOrSource<any>, rank: RankFunction<TIn>, options: Partial<RankOptions & OpMathOptions>): Reactive<TIn>;
export function rank<TIn>(input: ReactiveOrSource<any>, rank: RankFunction<TIn>, options: OpAsAnnotation & Partial<RankOptions & OpMathOptions>): Reactive<{ value: TIn, rank: TIn }>;
export function rank<TIn>(input: ReactiveOrSource<any>, rank: RankFunction<TIn>, options: Partial<RankOptions & OpMathOptions>): Reactive<TIn> | Reactive<{ value: TIn, rank: TIn }> {
  const p = Proc.rank(rank, options);
  return process(p, `rank`, input, options);
}

function process(processor: Proc.Process<any, any>, annotationField: string, input: ReactiveOrSource<any>, options: OpMathOptions = {}) {
  const annotate = options.annotate;
  let previous: number | undefined;
  const skipUndefined = options.skipUndefined ?? true;
  const skipIdentical = options.skipIdentical ?? true;
  const upstream = initUpstream<any, any>(input, {
    ...options,
    onValue(value) {
      const x = processor(value);
      if (x === undefined && skipUndefined) return;
      if (skipIdentical && x === previous) return;
      previous = x;
      if (annotate) {
        // eslint-disable-next-line unicorn/prevent-abbreviations
        const ret: any = { value };
        ret[ annotationField ] = x;
        upstream.set(ret);
      } else {
        upstream.set(x);
      }
    },
  })
  return toReadable(upstream);
}

//todo testing for annotation and non - annotated


// rankArray

// chunk, reduce

// debounce, delay

// duration, take