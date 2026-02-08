import { test, expect, describe } from 'vitest';
import { frequency, FrequencyTracker, GatedFrequencyTracker } from '../src/frequency-mutable.js';

describe('FrequencyTracker', () => {
  describe('basic counting', () => {
    test('counts single value', () => {
      const tracker = frequency<string>();
      tracker.add('a');
      
      expect(tracker.frequencyOf('a')).toBe(1);
    });

    test('counts multiple occurrences', () => {
      const tracker = frequency<string>();
      tracker.add('a');
      tracker.add('a');
      tracker.add('a');
      
      expect(tracker.frequencyOf('a')).toBe(3);
    });

    test('counts different values', () => {
      const tracker = frequency<string>();
      tracker.add('a');
      tracker.add('b');
      tracker.add('a');
      
      expect(tracker.frequencyOf('a')).toBe(2);
      expect(tracker.frequencyOf('b')).toBe(1);
    });

    test('returns undefined for unseen values', () => {
      const tracker = frequency<string>();
      tracker.add('a');
      
      expect(tracker.frequencyOf('z')).toBeUndefined();
    });
  });

  describe('add multiple values', () => {
    test('adds multiple values at once', () => {
      const tracker = frequency<string>();
      tracker.add('a', 'b', 'a');
      
      expect(tracker.frequencyOf('a')).toBe(2);
      expect(tracker.frequencyOf('b')).toBe(1);
    });
  });

  describe('computeValues', () => {
    test('computes statistics', () => {
      const tracker = frequency<string>();
      tracker.add('a');
      tracker.add('a');
      tracker.add('b');
      
      const stats = tracker.computeValues();
      expect(stats.total).toBe(3);
      expect(stats.max).toBe(2);
      expect(stats.min).toBe(1);
    });

    test('returns NaN when empty', () => {
      const tracker = frequency<string>();
      const stats = tracker.computeValues();
      // Empty tracker returns NaN for all stats
      expect(stats.total).toBeNaN();
      expect(stats.avg).toBeNaN();
    });
  });

  describe('entriesSorted', () => {
    test('returns entries sorted by frequency (ascending)', () => {
      const tracker = frequency<string>();
      tracker.add('c');
      tracker.add('a');
      tracker.add('a');
      tracker.add('b');
      tracker.add('a');
      tracker.add('b');

      const sorted = tracker.entriesSorted();
      // Default 'value' sort is ascending (smallest first)
      expect(sorted[0][0]).toBe('c'); // 1 occurrence
      expect(sorted[0][1]).toBe(1);
      expect(sorted[1][0]).toBe('b'); // 2 occurrences
      expect(sorted[1][1]).toBe(2);
      expect(sorted[2][0]).toBe('a'); // 3 occurrences
      expect(sorted[2][1]).toBe(3);
    });

    test('returns entries sorted by frequency descending', () => {
      const tracker = frequency<string>();
      tracker.add('c');
      tracker.add('a');
      tracker.add('a');
      tracker.add('b');
      tracker.add('a');
      tracker.add('b');

      const sorted = tracker.entriesSorted('value-reverse');
      expect(sorted[0][0]).toBe('a'); // 3 occurrences
      expect(sorted[0][1]).toBe(3);
      expect(sorted[1][0]).toBe('b'); // 2 occurrences
      expect(sorted[1][1]).toBe(2);
      expect(sorted[2][0]).toBe('c'); // 1 occurrence
      expect(sorted[2][1]).toBe(1);
    });
  });

  describe('relativeFrequencyOf', () => {
    test('calculates relative frequency', () => {
      const tracker = frequency<string>();
      tracker.add('a');
      tracker.add('a');
      tracker.add('b');
      
      expect(tracker.relativeFrequencyOf('a')).toBe(2 / 3);
      expect(tracker.relativeFrequencyOf('b')).toBe(1 / 3);
    });

    test('returns undefined for unseen values', () => {
      const tracker = frequency<string>();
      tracker.add('a');
      
      expect(tracker.relativeFrequencyOf('z')).toBeUndefined();
    });
  });

  describe('clear', () => {
    test('clears all counts', () => {
      const tracker = frequency<string>();
      tracker.add('a');
      tracker.add('b');

      tracker.clear();

      expect(tracker.frequencyOf('a')).toBeUndefined();
      expect(tracker.frequencyOf('b')).toBeUndefined();
      // After clearing, the tracker should be empty
      expect(tracker.toArray().length).toBe(0);
    });
  });

  describe('iteration', () => {
    test('keys iterator', () => {
      const tracker = frequency<string>();
      tracker.add('a');
      tracker.add('b');
      
      const keys = Array.from(tracker.keys());
      expect(keys).toContain('a');
      expect(keys).toContain('b');
    });

    test('values iterator', () => {
      const tracker = frequency<string>();
      tracker.add('a');
      tracker.add('a');
      tracker.add('b');
      
      const values = Array.from(tracker.values());
      expect(values).toContain(2);
      expect(values).toContain(1);
    });

    test('entries iterator', () => {
      const tracker = frequency<string>();
      tracker.add('a');
      tracker.add('b');
      
      const entries = Array.from(tracker.entries());
      expect(entries.length).toBe(2);
    });

    test('toArray', () => {
      const tracker = frequency<string>();
      tracker.add('a');
      tracker.add('b');
      
      const arr = tracker.toArray();
      expect(arr.length).toBe(2);
    });
  });

  describe('debugString', () => {
    test('returns debug string', () => {
      const tracker = frequency<string>();
      tracker.add('a');
      tracker.add('b');
      
      const debug = tracker.debugString();
      expect(typeof debug).toBe('string');
      expect(debug).toContain('a');
      expect(debug).toContain('b');
    });
  });

  describe('filterByTally', () => {
    test('filters by tally', () => {
      const tracker = frequency<string>();
      tracker.add('a');
      tracker.add('a');
      tracker.add('b');
      
      const filtered = Array.from(tracker.filterByTally(t => t > 1));
      expect(filtered.length).toBe(1);
      expect(filtered[0][0]).toBe('a');
    });
  });

  describe('filterByRelativeTally', () => {
    test('filters by relative tally', () => {
      const tracker = frequency<string>();
      tracker.add('a');
      tracker.add('a');
      tracker.add('b');
      
      const filtered = Array.from(tracker.filterByRelativeTally(t => t > 0.5));
      expect(filtered.length).toBe(1);
      expect(filtered[0][0]).toBe('a');
    });
  });

  describe('events', () => {
    test('fires change event on add', () => {
      const tracker = frequency<string>();
      let changed = false;
      
      tracker.addEventListener('change', () => {
        changed = true;
      });
      
      tracker.add('a');
      expect(changed).toBe(true);
    });

    test('fires change event on clear', () => {
      const tracker = frequency<string>();
      tracker.add('a');
      let changed = false;
      
      tracker.addEventListener('change', () => {
        changed = true;
      });
      
      tracker.clear();
      expect(changed).toBe(true);
    });
  });
});

describe('GatedFrequencyTracker', () => {
  test('counts with gate', () => {
    const tracker = new GatedFrequencyTracker<string>();
    
    tracker.add('a', 'source1');
    expect(tracker.ft.frequencyOf('a')).toBe(1);
    
    // Same source, should not increment
    tracker.add('a', 'source1');
    expect(tracker.ft.frequencyOf('a')).toBe(1);
    
    // Different source, should increment
    tracker.add('a', 'source2');
    expect(tracker.ft.frequencyOf('a')).toBe(2);
  });

  test('clear clears both tracker and sources', () => {
    const tracker = new GatedFrequencyTracker<string>();
    tracker.add('a', 'source1');
    
    tracker.clear();
    
    expect(tracker.ft.frequencyOf('a')).toBeUndefined();
    // After clear, same source should count again
    tracker.add('a', 'source1');
    expect(tracker.ft.frequencyOf('a')).toBe(1);
  });
});
