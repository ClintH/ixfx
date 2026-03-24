import type { StepArrayContext, StepContext, StepOptions } from '../src/traverse.js';
import { describe, expect, it } from "vitest";
import { compareTo } from '../src/compare-to.js';
import { FrequencyByGroup } from '../src/frequency.js';
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

  it (`random-step`, () => {
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

    const r1 = takeFromGenerator(g1(), 10);
    const r1Steps = [...compareTo(r1, 1, (a, b) => b - a)];
    // Since 'randomStepsMax' is 3, shouldn't expect any step length longer than that.
    expect(r1Steps.some(v => v > 3)).toBeFalsy();
    expect(r1Steps.some(v => v < 0)).toBeFalsy();
    expect(r1Steps.includes(1)).toBeTruthy();
    expect(r1Steps.includes(2)).toBeTruthy();
    expect(r1Steps.includes(3)).toBeTruthy();
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
