import { test, expect, describe } from 'vitest';
import { TrackedValueMap } from '../src/tracked-value.js';
import { NumberTracker } from '../src/number-tracker.js';
import type { NumberTrackerResults } from '../src/number-tracker.js';

describe(`TrackedValueMap`, () => {
  describe(`basic operations`, () => {
    test(`tracks values by id`, () => {
      const map = new TrackedValueMap<number, NumberTracker, NumberTrackerResults>(
        (id, start) => new NumberTracker({ id })
      );
      
      const result = map.seen(`key1`, 10);
      expect(result).toBeDefined();
      expect(result.total).toBe(10);
    });

    test(`stores multiple ids`, () => {
      const map = new TrackedValueMap<number, NumberTracker, NumberTrackerResults>(
        (id, start) => new NumberTracker({ id })
      );
      
      map.seen(`a`, 1);
      map.seen(`b`, 2);
      map.seen(`c`, 3);
      
      expect(map.size).toBe(3);
    });

    test(`has returns true for existing id`, () => {
      const map = new TrackedValueMap<number, NumberTracker, NumberTrackerResults>(
        (id, start) => new NumberTracker({ id })
      );
      
      map.seen(`exists`, 10);
      expect(map.has(`exists`)).toBe(true);
      expect(map.has(`notExists`)).toBe(false);
    });

    test(`get returns tracked value by id`, () => {
      const map = new TrackedValueMap<number, NumberTracker, NumberTrackerResults>(
        (id, start) => new NumberTracker({ id })
      );
      
      map.seen(`test`, 42);
      const tracker = map.get(`test`);
      
      expect(tracker).toBeDefined();
      expect((tracker as unknown as { last: number }).last).toBe(42);
    });

    test(`get returns undefined for missing id`, () => {
      const map = new TrackedValueMap<number, NumberTracker, NumberTrackerResults>(
        (id, start) => new NumberTracker({ id })
      );
      
      expect(map.get(`missing`)).toBeUndefined();
    });
  });

  describe(`delete operation`, () => {
    test(`deletes tracked value by id`, () => {
      const map = new TrackedValueMap<number, NumberTracker, NumberTrackerResults>(
        (id, start) => new NumberTracker({ id })
      );
      
      map.seen(`to-delete`, 10);
      expect(map.has(`to-delete`)).toBe(true);
      
      map.delete(`to-delete`);
      expect(map.has(`to-delete`)).toBe(false);
      expect(map.size).toBe(0);
    });

    test(`deleting non-existent id is safe`, () => {
      const map = new TrackedValueMap<number, NumberTracker, NumberTrackerResults>(
        (id, start) => new NumberTracker({ id })
      );
      
      expect(() => map.delete(`missing`)).not.toThrow();
    });
  });

  describe(`reset operation`, () => {
    test(`reset clears all tracked values`, () => {
      const map = new TrackedValueMap<number, NumberTracker, NumberTrackerResults>(
        (id, start) => new NumberTracker({ id })
      );
      
      map.seen(`a`, 1);
      map.seen(`b`, 2);
      map.seen(`c`, 3);
      
      expect(map.size).toBe(3);
      
      map.reset();
      
      expect(map.size).toBe(0);
      expect(map.has(`a`)).toBe(false);
    });
  });

  describe(`iterators`, () => {
    test(`ids() yields all ids`, () => {
      const map = new TrackedValueMap<number, NumberTracker, NumberTrackerResults>(
        (id, start) => new NumberTracker({ id })
      );
      
      map.seen(`a`, 1);
      map.seen(`b`, 2);
      map.seen(`c`, 3);
      
      const ids = [...map.ids()];
      expect(ids).toContain(`a`);
      expect(ids).toContain(`b`);
      expect(ids).toContain(`c`);
      expect(ids.length).toBe(3);
    });

    test(`tracked() yields all trackers`, () => {
      const map = new TrackedValueMap<number, NumberTracker, NumberTrackerResults>(
        (id, start) => new NumberTracker({ id })
      );
      
      map.seen(`a`, 1);
      map.seen(`b`, 2);
      
      const trackers = [...map.tracked()];
      expect(trackers.length).toBe(2);
      expect(trackers[0]).toBeInstanceOf(NumberTracker);
    });

    test(`last() yields last values`, () => {
      const map = new TrackedValueMap<number, NumberTracker, NumberTrackerResults>(
        (id, start) => new NumberTracker({ id })
      );
      
      map.seen(`a`, 10);
      map.seen(`b`, 20);
      
      const lastValues = [...map.last()];
      expect(lastValues).toContain(10);
      expect(lastValues).toContain(20);
    });

    test(`initialValues() yields initial values`, () => {
      const map = new TrackedValueMap<number, NumberTracker, NumberTrackerResults>(
        (id, start) => new NumberTracker({ id })
      );
      
      map.seen(`a`, 10);
      map.seen(`b`, 20);
      
      const initials = [...map.initialValues()];
      expect(initials).toContain(10);
      expect(initials).toContain(20);
    });
  });

  describe(`trackedByAge()`, () => {
    test(`yields trackers sorted by elapsed time`, async () => {
      const map = new TrackedValueMap<number, NumberTracker, NumberTrackerResults>(
        (id, start) => new NumberTracker({ id })
      );
      
      map.seen(`first`, 1);
      await new Promise(r => setTimeout(r, 10));
      map.seen(`second`, 2);
      
      const trackers = [...map.trackedByAge()];
      expect(trackers.length).toBe(2);
      expect(trackers[0].id).toBe(`first`);
      expect(trackers[1].id).toBe(`second`);
    });

    test(`yields empty for empty map`, () => {
      const map = new TrackedValueMap<number, NumberTracker, NumberTrackerResults>(
        (id, start) => new NumberTracker({ id })
      );
      
      const trackers = [...map.trackedByAge()];
      expect(trackers.length).toBe(0);
    });
  });

  describe(`valuesByAge()`, () => {
    test(`yields values sorted by age`, async () => {
      const map = new TrackedValueMap<number, NumberTracker, NumberTrackerResults>(
        (id, start) => new NumberTracker({ id })
      );
      
      map.seen(`older`, 1);
      await new Promise(r => setTimeout(r, 10));
      map.seen(`newer`, 2);
      
      const values = [...map.valuesByAge()];
      expect(values[0]).toBe(1);
      expect(values[1]).toBe(2);
    });
  });

  describe(`error handling`, () => {
    test(`throws on null id`, () => {
      const map = new TrackedValueMap<number, NumberTracker, NumberTrackerResults>(
        (id, start) => new NumberTracker({ id })
      );
      
      expect(() => (map as unknown as { seen(id: null, ...args: number[]): void }).seen(null, 10)).toThrow(`id parameter cannot be null`);
    });

    test(`throws on undefined id`, () => {
      const map = new TrackedValueMap<number, NumberTracker, NumberTrackerResults>(
        (id, start) => new NumberTracker({ id })
      );
      
      expect(() => (map as unknown as { seen(id: undefined, ...args: number[]): void }).seen(undefined, 10)).toThrow(`id parameter cannot be undefined`);
    });
  });

  describe(`size property`, () => {
    test(`returns correct count`, () => {
      const map = new TrackedValueMap<number, NumberTracker, NumberTrackerResults>(
        (id, start) => new NumberTracker({ id })
      );
      
      expect(map.size).toBe(0);
      
      map.seen(`a`, 1);
      expect(map.size).toBe(1);
      
      map.seen(`b`, 2);
      expect(map.size).toBe(2);
      
      map.delete(`a`);
      expect(map.size).toBe(1);
    });
  });
});
