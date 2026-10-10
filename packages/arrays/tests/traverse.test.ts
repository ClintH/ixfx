import type { StepContext, StepOptions } from '../src/traverse.js';
import { describe, expect, it } from "vitest";
import { arrayIndexStepper, step } from '../src/traverse.js';
import { takeFromGenerator } from '../src/until.js';

describe(`arrayIndexStepper`, () => {
  it (`basic-no-loop`, () => {
    const data = [`a`, `b`, `c`, `d`, `e`] as const;

    // Forward
    expect([...arrayIndexStepper({ steps: 1, loop: `none`, forward: true, repeatLoopedIndex: false }, { data })()]).toStrictEqual([0, 1, 2, 3, 4]);
    expect([...arrayIndexStepper({ steps: 2, loop: `none`, forward: true, repeatLoopedIndex: false }, { data })()]).toStrictEqual([0, 2, 4]);
    // Backward
    expect([...arrayIndexStepper({ steps: 1, loop: `none`, forward: false, repeatLoopedIndex: false }, { data })()]).toStrictEqual([4, 3, 2, 1, 0]);
    expect([...arrayIndexStepper({ steps: 2, loop: `none`, forward: false, repeatLoopedIndex: false }, { data })()]).toStrictEqual([4, 2, 0]);
  });

  it (`basic`, () => {
    const data = [`a`, `b`, `c`, `d`, `e`] as const;

    const g1 = arrayIndexStepper({
      steps: 1,
      forward: true,
      loop: `pingpong`,
      repeatLoopedIndex: false,
    }, { data });

    expect(takeFromGenerator(g1(), 10)).toStrictEqual([0, 1, 2, 3, 4, 3, 2, 1, 0, 1]);
    // Test repeatability
    expect(takeFromGenerator(g1(), 10)).toStrictEqual([0, 1, 2, 3, 4, 3, 2, 1, 0, 1]);

    const g2 = arrayIndexStepper({
      steps: 1,
      forward: true,
      loop: `pingpong`,
      repeatLoopedIndex: true,
      debug: false,
    }, { data });
    expect(takeFromGenerator(g2(), 15)).toStrictEqual([0, 1, 2, 3, 4, 4, 3, 2, 1, 0, 0, 1, 2, 3, 4]);
    // Test repeatability
    expect(takeFromGenerator(g2(), 15)).toStrictEqual([0, 1, 2, 3, 4, 4, 3, 2, 1, 0, 0, 1, 2, 3, 4]);
  });

  it (`random-flip`, () => {
    const data = [`a`, `b`, `c`, `d`, `e`] as const;

    const g1 = arrayIndexStepper({
      steps: 1,
      forward: true,
      loop: `pingpong`,
      randomDirectionFlip: 1,
      repeatLoopedIndex: false,
    }, { data });

    expect(takeFromGenerator(g1(), 10)).toStrictEqual([0, 1, 0, 1, 0, 1, 0, 1, 0, 1]);

    const g2 = arrayIndexStepper({
      steps: 1,
      forward: false,
      loop: `pingpong`,
      randomDirectionFlip: 1,
      repeatLoopedIndex: false,
    }, { data });

    expect(takeFromGenerator(g2(), 10)).toStrictEqual([4, 3, 4, 3, 4, 3, 4, 3, 4, 3]);
  });

  it (`random-step-deterministic`, () => {
    const data = `a b c d e f g h i j k l m n o p q r s t u v w x y z`.split(` `);

    // Cyclic source of 'random' values. Each step consumes two values:
    // one for the chance check (always <= 1) and one for the step length,
    // computed as floor(v * 3) + 1. With values 0.1, 0.5, 0.9 the pairing
    // (check, length) yields step lengths that cycle 2, 1, 3.
    const values = [0.1, 0.5, 0.9];
    let pointer = 0;
    const randomSource = () => {
      const v = values[pointer % values.length];
      pointer++;
      return v;
    };

    const g1 = arrayIndexStepper({
      steps: 1,
      forward: true,
      loop: `pingpong`,
      randomDirectionFlip: 0,
      randomChanceSteps: 1,
      randomStepsMax: 3,
      repeatLoopedIndex: false,
    }, { data, randomSource });

    expect(takeFromGenerator(g1(), 10)).toStrictEqual([0, 2, 3, 6, 8, 9, 12, 14, 15, 18]);
  });

  it (`random-step-range`, () => {
    const data = `a b c d e f g h i j k l m n o p q r s t u v w x y z`.split(` `);

    const g1 = arrayIndexStepper({
      steps: 1,
      forward: true,
      loop: `pingpong`,
      randomDirectionFlip: 0,
      randomChanceSteps: 1,
      randomStepsMax: 3,
      repeatLoopedIndex: false,
    }, { data });

    // Statistical test using default random source: assert invariants rather
    // than specific values. Hops must not exceed 'randomStepsMax'. A hop of
    // zero is possible: a bounce off the start/end index can land on the
    // same index (eg. 24 +2 → 26 → reflected back to 24).
    const indices = takeFromGenerator(g1(), 100);
    for (const index of indices) {
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThanOrEqual(data.length - 1);
    }
    const hops = indices.slice(1).map((v, i) => Math.abs(v - indices[i]));
    for (const hop of hops) {
      expect(hop).toBeLessThanOrEqual(3);
    }
  });
});

describe(`step`, () => {
  const defaultOpts = (): StepOptions => ({ steps: 1, loop: `pingpong`, forward: true, randomChanceSteps: 0, randomStepsMax: 1, randomDirectionFlip: 0, repeatLoopedIndex: false });

  it (`basic`, () => {
    const context: StepContext = { startIndex: 2, endIndex: 5 };
    const options: StepOptions = { ...defaultOpts(), steps: 1, loop: `pingpong` };
    expect(step({ index: 2, incrementing: true }, options, context)).toStrictEqual({ index: 3, incrementing: true, done: false });
    expect(step({ index: 3, incrementing: true }, options, context)).toStrictEqual({ index: 4, incrementing: true, done: false });
    expect(step({ index: 4, incrementing: true }, options, context)).toStrictEqual({ index: 5, incrementing: true, done: false });
    expect(step({ index: 5, incrementing: true }, options, context)).toStrictEqual({ index: 4, incrementing: false, done: false });
    expect(step({ index: 4, incrementing: false }, options, context)).toStrictEqual({ index: 3, incrementing: false, done: false });
    expect(step({ index: 3, incrementing: false }, options, context)).toStrictEqual({ index: 2, incrementing: false, done: false });
    expect(step({ index: 2, incrementing: false }, options, context)).toStrictEqual({ index: 3, incrementing: true, done: false });
  });

  it (`basic-no-loop`, () => {
    const context: StepContext = { startIndex: 2, endIndex: 5 };
    const options: StepOptions = { ...defaultOpts(), steps: 1, loop: `none` };
    expect(step({ index: 2, incrementing: true }, options, context)).toStrictEqual({ index: 3, incrementing: true, done: false });
    expect(step({ index: 3, incrementing: true }, options, context)).toStrictEqual({ index: 4, incrementing: true, done: false });
    expect(step({ index: 4, incrementing: true }, options, context)).toStrictEqual({ index: 5, incrementing: true, done: true });
    expect(step({ index: 5, incrementing: true }, options, context)).toStrictEqual({ index: 5, incrementing: true, done: true });
    expect(step({ index: 4, incrementing: false }, options, context)).toStrictEqual({ index: 3, incrementing: false, done: false });
    expect(step({ index: 3, incrementing: false }, options, context)).toStrictEqual({ index: 2, incrementing: false, done: true });
    expect(step({ index: 2, incrementing: false }, options, context)).toStrictEqual({ index: 2, incrementing: false, done: true });
  });

  it (`two-step`, () => {
    const context: StepContext = { startIndex: 2, endIndex: 5 };
    const options: StepOptions = { ...defaultOpts(), steps: 2, loop: `pingpong`, forward: true };
    expect(step({ index: 2, incrementing: true }, options, context)).toStrictEqual({ index: 4, incrementing: true, done: false });
    expect(step({ index: 3, incrementing: true }, options, context)).toStrictEqual({ index: 5, incrementing: true, done: false });
    expect(step({ index: 4, incrementing: true }, options, context)).toStrictEqual({ index: 4, incrementing: false, done: false });
    expect(step({ index: 4, incrementing: false }, options, context)).toStrictEqual({ index: 2, incrementing: false, done: false });
    expect(step({ index: 2, incrementing: false }, options, context)).toStrictEqual({ index: 4, incrementing: true, done: false });
    expect(step({ index: 4, incrementing: true }, options, context)).toStrictEqual({ index: 4, incrementing: false, done: false });
    expect(step({ index: 4, incrementing: false }, options, context)).toStrictEqual({ index: 2, incrementing: false, done: false });
  });
});
