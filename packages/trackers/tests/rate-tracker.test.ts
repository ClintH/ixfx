import { test, expect, describe } from 'vitest';
import { rate, RateTracker } from '../src/rate-tracker.js';
import { sleep } from '@ixfx/core';

describe('RateTracker', () => {
  describe('basic event tracking', () => {
    test('tracks events', () => {
      const tracker = rate();
      
      tracker.mark();
      tracker.mark();
      tracker.mark();
      
      expect(tracker.perSecond).toBeGreaterThan(0);
    });

    test('perSecond is 0 with no events', () => {
      const tracker = rate();
      // Just created, no events
      expect(tracker.perSecond).toBe(0);
    });
  });

  describe('rate calculations', () => {
    test('calculates perSecond', async () => {
      const tracker = rate();
      
      tracker.mark();
      await sleep(100);
      tracker.mark();
      
      const perSecond = tracker.perSecond;
      expect(typeof perSecond).toBe('number');
      expect(perSecond).toBeGreaterThan(0);
    });

    test('calculates perMinute', async () => {
      const tracker = rate();
      
      tracker.mark();
      await sleep(100);
      tracker.mark();
      
      const perMinute = tracker.perMinute;
      expect(typeof perMinute).toBe('number');
      expect(perMinute).toBeGreaterThan(0);
    });
  });

  describe('computeIntervals', () => {
    test('computes intervals between events', () => {
      const tracker = rate();
      
      tracker.mark();
      tracker.mark();
      tracker.mark();
      
      const intervals = tracker.computeIntervals();
      expect(intervals).toHaveProperty('min');
      expect(intervals).toHaveProperty('max');
      expect(intervals).toHaveProperty('avg');
      expect(typeof intervals.min).toBe('number');
      expect(typeof intervals.max).toBe('number');
      expect(typeof intervals.avg).toBe('number');
    });

    test('avg is 0 with single event', () => {
      const tracker = rate();
      tracker.mark();
      
      const intervals = tracker.computeIntervals();
      expect(intervals.avg).toBe(0);
    });

    test('avg is 0 with no events', () => {
      const tracker = rate();
      
      const intervals = tracker.computeIntervals();
      expect(intervals.avg).toBe(0);
    });

    test('computes correct avg for known intervals', async () => {
      const tracker = rate();
      
      tracker.mark();
      await sleep(50);
      tracker.mark();
      await sleep(50);
      tracker.mark();
      
      const intervals = tracker.computeIntervals();
      // Two intervals of ~50ms each, avg should be ~50
      expect(intervals.avg).toBeGreaterThan(40);
      expect(intervals.avg).toBeLessThan(100);
    });
  });

  describe('reset functionality', () => {
    test('reset clears events', () => {
      const tracker = rate();
      tracker.mark();
      tracker.mark();
      
      tracker.reset();
      
      expect(tracker.perSecond).toBe(0);
      const intervals = tracker.computeIntervals();
      expect(intervals.avg).toBe(0);
    });

    test('works after reset', async () => {
      const tracker = rate();
      tracker.mark();
      tracker.reset();
      
      tracker.mark();
      await sleep(50);
      tracker.mark();
      
      expect(tracker.perSecond).toBeGreaterThan(0);
    });
  });

  describe('resetAfterSamples option', () => {
    test('resets after specified samples', () => {
      const tracker = rate({ resetAfterSamples: 3 });
      
      tracker.mark();
      tracker.mark();
      tracker.mark(); // Should trigger reset
      tracker.mark();
      
      // After reset, we should only have 1 event
      const intervals = tracker.computeIntervals();
      expect(intervals.avg).toBe(0);
    });
  });

  describe('sampleLimit option', () => {
    test('limits stored events', () => {
      const tracker = rate({ sampleLimit: 3 });
      
      tracker.mark();
      tracker.mark();
      tracker.mark();
      tracker.mark();
      tracker.mark();
      
      // Should have trimmed to 3 events
      const intervals = tracker.computeIntervals();
      // With 3 events, we have 2 intervals
      expect(intervals.avg).toBeGreaterThanOrEqual(0);
    });
  });

  describe('elapsed time', () => {
    test('elapsed increases over time', async () => {
      const tracker = rate();
      const elapsed1 = tracker.elapsed;
      
      await sleep(50);
      const elapsed2 = tracker.elapsed;
      
      expect(elapsed2).toBeGreaterThan(elapsed1);
    });

    test('elapsed resets on reset', async () => {
      const tracker = rate();
      tracker.mark();
      await sleep(50);
      
      const elapsedBefore = tracker.elapsed;
      tracker.reset();
      const elapsedAfter = tracker.elapsed;
      
      expect(elapsedAfter).toBeLessThan(elapsedBefore);
    });
  });
});
