import type { Interval } from "../../flow/IntervalType.js";
import * as Async from "../IterableAsync.js";
import { func as fromFunction } from "./from/Function.js";
import type { GenOrData, LazyChain, DelayOptions, Link } from "./Types.js";
import { isGenFactoryNoInput, resolveToAsyncGen } from "./Util.js";
import * as L from './Links.js';
import type { RankFunction, RankArrayOptions, RankOptions } from "../../data/Types.js";

const getLinkName = (c: Link<any, any>): string => {
  //return c._name;
  return c._name ?? c.name;
}

export function lazy<In, Out>(): LazyChain<In, Out> {
  const chained: Array<Link<any, any>> = [];
  let dataToUse: GenOrData<In> | undefined;

  const asGenerator = <V>(data?: GenOrData<In>) => {
    if (data === undefined) data = dataToUse;
    let d = resolveToAsyncGen(data);
    for (const c of chained) {
      if (d === undefined) {
        if (isGenFactoryNoInput<In>(c)) {
          d = c();
        } else {
          throw new Error(`Function '${ getLinkName(c) }' requires input. Provide it to the function, or call 'input' earlier.`)
        }
      } else {
        d = c(d);
      }
    }
    return d as AsyncGenerator<V>
  }

  const w: LazyChain<In, Out> = {
    rankArray: (r: RankFunction<In>, options: Partial<RankArrayOptions>): LazyChain<In, Out> => {
      chained.push(L.rankArray(r, options));
      return w;
    },
    rank: (r: RankFunction<In>, options: Partial<RankOptions>): LazyChain<In, Out> => {
      chained.push(L.rank(r, options));
      return w;
    },
    transform: (transformer: (v: any) => any) => {
      chained.push(L.transform(transformer));
      return w;
    },
    reduce: (reducer: (values: Array<any>) => any) => {
      // eslint-disable-next-line unicorn/no-array-callback-reference, unicorn/no-array-reduce
      chained.push(L.reduce(reducer));
      return w;
    },
    drop: (predicate: (v: In) => boolean) => {
      chained.push(L.drop(predicate));
      return w;
    },
    delay: (options: DelayOptions) => {
      chained.push(L.delay(options));
      return w;
    },
    duration: (elapsed: Interval) => {
      chained.push(L.duration(elapsed));
      return w;
    },
    debounce: (rate: Interval) => {
      chained.push(L.debounce(rate));
      return w;
    },
    fromFunction: (callback: () => any) => {
      chained.push(fromFunction(callback));
      return w;
    },
    take: (limit: number) => {
      chained.push(L.take(limit));
      return w;
    },
    chunk: (size: number, returnRemainders = true) => {
      chained.push(L.chunk(size, returnRemainders))
      return w;
    },
    filter: (predicate: (input: any) => boolean) => {
      chained.push(L.filter(v => predicate(v)));
      return w;
    },
    min: (): LazyChain<any, number> => {
      chained.push(L.min());
      return w as unknown as LazyChain<any, number>;
    },
    max: (): LazyChain<any, number> => {
      chained.push(L.max());
      return w as unknown as LazyChain<any, number>;
    },
    average: (): LazyChain<any, number> => {
      chained.push(L.average());
      return w as unknown as LazyChain<any, number>;
    },
    sum: (): LazyChain<any, number> => {
      chained.push(L.sum());
      return w as unknown as LazyChain<any, number>;
    },
    tally: (countArrayItems: boolean): LazyChain<any, number> => {
      chained.push(L.tally(countArrayItems));
      return w as unknown as LazyChain<any, number>;
    },
    input(data: GenOrData<In>) {
      dataToUse = data;
      return w
    },
    asGenerator,
    asAsync(data?: GenOrData<In>) {
      let d = data ?? dataToUse;
      for (const c of chained) {
        if (d === undefined && isGenFactoryNoInput<In>(c)) {
          d = c();
        } else if (d === undefined) {
          throw new Error(`Function '${ getLinkName(c) }' needs input. Pass in data calling 'asAsync', or call 'input' earlier`);
        } else {
          d = c(d);
        }
      }
      return w;
    },
    asArray: async (data?: GenOrData<In>): Promise<Array<Out>> => {
      const g = asGenerator<Out>(data);
      return await Async.toArray<Out>(g);
    },
    firstOutput: async (data?: GenOrData<In>): Promise<Out | undefined> => {
      const g = asGenerator<Out>(data);
      const v = await g.next();
      return v.value as Out;
    },
    lastOutput: async (data?: GenOrData<In>): Promise<Out | undefined> => {
      const g = asGenerator<Out>(data);
      let lastValue: Out | undefined;
      for await (const v of g) {
        lastValue = v as Out;
      }
      return lastValue;
    },
  }
  return w as unknown as LazyChain<In, Out>;
}