import test, {ExecutionContext} from "ava";
import {minMaxAvg} from "../collections/NumericArrays.js";

//test.todo('sf');

export const areIntegers = (t:ExecutionContext, a:Array<number>) => {
  for (let i=0;i<a.length;i++) {
    t.is((Math.abs(a[i]) % 1), 0, `Integer ${a[i]}`);
  }
}

export const equalUnordered = (t:ExecutionContext, a:Array<any>, b:Array<any>) => {
  // if (a.length !== b.length) {
  //   t.fail(`length ${a.length} expected ${b.length}`);
  //   return;
  // }
  t.is(a.length, b.length, `Array length`);

  const aa = [...a].sort();
  const bb = [...b].sort();
  for (let i=0;i<aa.length;i++) {
    // if (aa[i] !== bb[i]) {
    //   t.fail(`Index ${i} ${aa[i]}, expected ${bb[i]}`);

    //   return;
    // }
    t.is(aa[i], bb[i], `Contents at ${i}`);
  }
} 

export type ExpectedOpts = {
  lowerIncl?:number, 
  upperIncl?:number,
  lowerExcl?:number,
  upperExcl?:number
}

export const rangeCheckInteger = (t:ExecutionContext, v:Array<number>, expected:ExpectedOpts) => {
  rangeCheck(t, v, expected);
  areIntegers(t, v);
}

export const rangeCheck = (t:ExecutionContext, v:Array<number>, expected:ExpectedOpts) => {
  const {min,max} = minMaxAvg(v);
  if (expected.lowerExcl !== undefined) {
    if (min < expected.lowerExcl) {
      t.is(min, expected.lowerExcl, 'Lower exclusive');
    }
  }
  if (expected.lowerIncl !== undefined) {
    if (min >= expected.lowerIncl) {
      t.is(min, expected.lowerIncl, 'Lower inclusive');
    }
  }
  if (expected.upperExcl !== undefined) {
    if (max > expected.upperExcl) {
      t.is(max, expected.upperExcl, 'Upper exclusive');
    }
  }
  if (expected.upperIncl !== undefined) {
    if (max <= expected.upperIncl) {
      t.is(max, expected.upperIncl, 'Upper inclusive');
    }
  }
};