import type { NumbersComputeOptions, NumbersComputeResult } from "@ixfxfun/numbers";
import { slice } from "./sync.js";
import type { L } from "vitest/dist/chunks/reporters.d.CfRkRKN2.js";

export function numbersCompute(data: Iterable<number>, options: NumbersComputeOptions = {}): NumbersComputeResult {
  // if (typeof options.startIndex !== `undefined` || typeof options.endIndex !== `undefined`) {
  //   data = slice(data, options.startIndex, options.endIndex);
  // }
  let total = 0;
  const nonNumbers = options.nonNumbers ?? `ignore`;

  let min = Number.MAX_SAFE_INTEGER;
  let max = Number.MIN_SAFE_INTEGER;
  let count = 0;
  for (let v of data) {
    if (typeof v !== `number` || Number.isNaN(v)) {
      if (nonNumbers === `throw`) throw new TypeError(`Data contains something not a number. Got type '${ typeof v }'`);
      if (nonNumbers === `nan`) v = Number.NaN;
      if (nonNumbers === `ignore`) continue;
    }

    total += v;
    count++;
    min = Math.min(min, v);
    max = Math.max(max, v);
  }
  return {
    avg: total / count,
    total, max, min, count
  };
}

export function computeAverage(data: Iterable<number>, options: NumbersComputeOptions = {}): number {
  let count = 0;
  let total = 0;
  const nonNumbers = options.nonNumbers ?? `ignore`;

  for (let d of data) {
    if (typeof d !== `number` || Number.isNaN(d)) {
      if (nonNumbers === `throw`) throw new TypeError(`Data contains something not a number. Got type '${ typeof d }'`);
      if (nonNumbers === `nan`) d = Number.NaN;
      if (nonNumbers === `ignore`) continue;
    }
    total += d;
    count++;
  }
  return total / count;
}