import { initUpstream } from "../InitStream.js";
import { toReadable } from "../ToReadable.js";
import type { Reactive, ReactiveOrSource } from "../Types.js";
import * as BasicProcessors from '../../data/BasicProcessors.js';
import type { Process } from "src/data/Process.js";
import type { OpAsAnnotation, OpMathOptions } from "./Types.js";

export function max(input: ReactiveOrSource<any>, options: OpMathOptions): Reactive<number>;
export function max(input: ReactiveOrSource<any>, options: OpAsAnnotation & OpMathOptions): Reactive<{ value: number, max: number }>;
export function max(input: ReactiveOrSource<any>, options: OpMathOptions): Reactive<number> | Reactive<{ value: number, max: number }> {
  const p = BasicProcessors.max();
  return process(p, `max`, input, options);
}

export function min(input: ReactiveOrSource<any>, options: OpMathOptions): Reactive<number>;
export function min(input: ReactiveOrSource<any>, options: OpAsAnnotation & OpMathOptions): Reactive<{ value: number, min: number }>;
export function min(input: ReactiveOrSource<any>, options: OpMathOptions): Reactive<number> | Reactive<{ value: number, min: number }> {
  const p = BasicProcessors.min();
  return process(p, `min`, input, options);
}

export function average(input: ReactiveOrSource<any>, options: OpMathOptions): Reactive<number>;
export function average(input: ReactiveOrSource<any>, options: OpAsAnnotation & OpMathOptions): Reactive<{ value: number, average: number }>;
export function average(input: ReactiveOrSource<any>, options: OpMathOptions): Reactive<number> | Reactive<{ value: number, average: number }> {
  const p = BasicProcessors.average();
  return process(p, `average`, input, options);
}

export function sum(input: ReactiveOrSource<any>, options: OpMathOptions): Reactive<number>;
export function sum(input: ReactiveOrSource<any>, options: OpAsAnnotation & OpMathOptions): Reactive<{ value: number, sum: number }>;
export function sum(input: ReactiveOrSource<any>, options: OpMathOptions): Reactive<number> | Reactive<{ value: number, sum: number }> {
  const p = BasicProcessors.sum();
  return process(p, `sum`, input, options);
}

export type TallyOptions = OpMathOptions & {
  countArrayItems: boolean
}

export function tally(input: ReactiveOrSource<any>, options: Partial<TallyOptions>): Reactive<number>;
export function tally<TIn>(input: ReactiveOrSource<TIn>, options: OpAsAnnotation & Partial<TallyOptions>): Reactive<{ value: TIn, tally: number }>;
export function tally<TIn>(input: ReactiveOrSource<TIn>, options: Partial<TallyOptions> = {}): Reactive<number> | Reactive<{ value: TIn, tally: number }> {
  const countArrayItems = options.countArrayItems ?? true;
  const p = BasicProcessors.tally(countArrayItems);
  return process(p, `tally`, input, options);
}

export function rank<TIn>(input: ReactiveOrSource<any>, rank: BasicProcessors.RankFunction<TIn>, options: Partial<BasicProcessors.RankOptions & OpMathOptions>): Reactive<TIn>;
export function rank<TIn>(input: ReactiveOrSource<any>, rank: BasicProcessors.RankFunction<TIn>, options: OpAsAnnotation & Partial<BasicProcessors.RankOptions & OpMathOptions>): Reactive<{ value: TIn, rank: TIn }>;
export function rank<TIn>(input: ReactiveOrSource<any>, rank: BasicProcessors.RankFunction<TIn>, options: Partial<BasicProcessors.RankOptions & OpMathOptions>): Reactive<TIn> | Reactive<{ value: TIn, rank: TIn }> {
  const p = BasicProcessors.rank(rank, options);
  return process(p, `rank`, input, options);
}

function process(processor: Process<any, any>, annotationField: string, input: ReactiveOrSource<any>, options: OpMathOptions = {}) {
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