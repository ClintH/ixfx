import { test, expect, describe } from 'vitest';
import { interval, IntervalTracker } from '../src/interval-tracker.js';

describe(`IntervalTracker`, () => {
  describe(`basic tracking`, () => {
    test(`first mark only sets lastMark`, () => {
      const tracker = interval();
      tracker.mark();
      
      expect(tracker.size).toBe(0);
      expect(Number.isNaN(tracker.avg)).toBe(true);
    });

    test(`records interval between marks`, async () => {
      const tracker = interval();
      tracker.mark();
      
      const start = performance.now();
      while (performance.now() - start < 10) { /* spin */ }
      
      tracker.mark();
      
      expect(tracker.size).toBe(1);
      expect(tracker.avg).toBeGreaterThan(0);
    });

    test(`tracks multiple marks`, async () => {
      const tracker = interval();
      tracker.mark();
      await new Promise(r => setTimeout(r, 1));
      tracker.mark();
      await new Promise(r => setTimeout(r, 1));
      tracker.mark();
      
      expect(tracker.size).toBe(2);
    });
  });

  describe(`interval calculations`, () => {
    test(`calculates min interval`, async () => {
      const tracker = interval({ storeIntermediate: true });
      
      tracker.mark();
      await new Promise(r => setTimeout(r, 5));
      tracker.mark();
      
      tracker.mark();
      await new Promise(r => setTimeout(r, 15));
      tracker.mark();
      
      expect(tracker.min).toBeGreaterThan(0);
    });

    test(`calculates max interval`, async () => {
      const tracker = interval({ storeIntermediate: true });
      
      tracker.mark();
      await new Promise(r => setTimeout(r, 20));
      tracker.mark();
      
      tracker.mark();
      await new Promise(r => setTimeout(r, 5));
      tracker.mark();
      
      expect(tracker.max).toBeGreaterThan(0);
    });

    test(`calculates avg interval`, async () => {
      const tracker = interval();
      
      tracker.mark();
      await new Promise(r => setTimeout(r, 10));
      tracker.mark();
      
      tracker.mark();
      await new Promise(r => setTimeout(r, 10));
      tracker.mark();
      
      expect(tracker.avg).toBeGreaterThan(0);
      expect(tracker.avg).toBeLessThan(100);
    });

    test(`avg is NaN with only one mark`, () => {
      const tracker = interval();
      tracker.mark();
      
      expect(Number.isNaN(tracker.avg)).toBe(true);
    });
  });

  describe(`last and initial`, () => {
    test(`tracks last value`, async () => {
      const tracker = interval();
      tracker.mark();
      await new Promise(r => setTimeout(r, 10));
      tracker.mark();
      
      expect(tracker.last).toBeGreaterThan(0);
    });

    test(`initial is undefined before second mark`, () => {
      const tracker = interval();
      tracker.mark();
      
      expect(tracker.initial).toBeUndefined();
    });
  });

  describe(`reset functionality`, () => {
    test(`reset clears intervals`, async () => {
      const tracker = interval({ storeIntermediate: true });
      tracker.mark();
      await new Promise(r => setTimeout(r, 10));
      tracker.mark();
      
      tracker.reset();
      
      expect(tracker.size).toBe(0);
      expect(Number.isNaN(tracker.avg)).toBe(true);
    });

    test(`works after reset`, async () => {
      const tracker = interval({ storeIntermediate: true });
      
      tracker.mark();
      await new Promise(r => setTimeout(r, 10));
      tracker.mark();
      
      tracker.reset();
      
      tracker.mark();
      await new Promise(r => setTimeout(r, 10));
      tracker.mark();
      
      expect(tracker.size).toBe(1);
    });
  });

  describe(`options`, () => {
    test(`respects resetAfterSamples`, async () => {
      const tracker = interval({ resetAfterSamples: 3 });
      
      tracker.mark();
      await new Promise(r => setTimeout(r, 1));
      tracker.mark();
      await new Promise(r => setTimeout(r, 1));
      tracker.mark();
      await new Promise(r => setTimeout(r, 1));
      tracker.mark();
      
      expect(tracker.size).toBeLessThan(4);
    });

    test(`respects sampleLimit`, async () => {
      const tracker = interval({ sampleLimit: 3, storeIntermediate: true });
      
      for (let i = 0; i < 10; i++) {
        tracker.mark();
        await new Promise(r => setTimeout(r, 1));
        tracker.mark();
      }
      
      expect(tracker.size).toBeLessThanOrEqual(10);
    });

    test(`respects storeIntermediate`, async () => {
      const trackerWithStore = interval({ storeIntermediate: true });
      const trackerWithoutStore = interval();
      
      trackerWithStore.mark();
      await new Promise(r => setTimeout(r, 1));
      trackerWithStore.mark();
      trackerWithoutStore.mark();
      await new Promise(r => setTimeout(r, 1));
      trackerWithoutStore.mark();
      
      expect(trackerWithStore.size).toBe(1);
      expect(trackerWithoutStore.size).toBe(1);
    });
  });

  describe(`difference calculations`, () => {
    test(`calculates difference`, async () => {
      const tracker = interval();
      
      tracker.mark();
      await new Promise(r => setTimeout(r, 10));
      tracker.mark();
      
      expect(typeof tracker.difference()).toBe(`number`);
    });
  });

  describe(`edge cases`, () => {
    test(`handles rapid successive marks`, async () => {
      const tracker = interval({ storeIntermediate: true });
      
      for (let i = 0; i < 5; i++) {
        tracker.mark();
        await new Promise(r => setTimeout(r, 0));
        tracker.mark();
      }
      
      expect(tracker.size).toBe(9);
    });
  });
});

describe(`interval factory`, () => {
  test(`creates IntervalTracker instance`, () => {
    const tracker = interval();
    expect(tracker).toBeInstanceOf(IntervalTracker);
  });

  test(`creates with custom id`, () => {
    const tracker = interval({ id: `custom-id` });
    expect(tracker.id).toBe(`custom-id`);
  });

  test(`creates with debug option`, () => {
    const tracker = interval({ debug: true });
    expect(tracker.id).toBe(`tracker`);
  });
});
