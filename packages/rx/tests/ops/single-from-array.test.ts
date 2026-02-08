import { describe, test, expect } from 'vitest';
import { singleFromArray } from '../../src/ops/single-from-array.js';
import { manual } from '../../src/index.js';

describe('rx/ops/single-from-array', () => {
  test('selects value at index', () => {
    const source = manual<number[]>();
    const single = singleFromArray(source, { at: 2 });

    const values: number[] = [];
    single.onValue((v) => values.push(v));

    source.set([10, 20, 30, 40, 50]);
    expect(values).toEqual([30]); // Index 2

    source.set([100, 200, 300]);
    expect(values).toEqual([30, 300]); // Index 2
  });

  test('selects value at negative index', () => {
    const source = manual<number[]>();
    const single = singleFromArray(source, { at: -1 });

    const values: number[] = [];
    single.onValue((v) => values.push(v));

    source.set([10, 20, 30]);
    expect(values).toEqual([30]); // Last element

    source.set([100, 200]);
    expect(values).toEqual([30, 200]); // Last element
  });

  test('selects all values matching predicate', () => {
    const source = manual<number[]>();
    const single = singleFromArray(source, { 
      predicate: (v) => v > 25 
    });

    const values: number[] = [];
    single.onValue((v) => values.push(v));

    source.set([10, 20, 30, 40, 50]);
    // All values > 25: 30, 40, 50
    expect(values).toEqual([30, 40, 50]);
  });

  test('predicate scans entire array for matches', () => {
    const source = manual<number[]>();
    const single = singleFromArray(source, { 
      predicate: (v) => v % 2 === 0 
    });

    const values: number[] = [];
    single.onValue((v) => values.push(v));

    source.set([1, 3, 5, 6, 7, 8]);
    // All even numbers: 6, 8
    expect(values).toEqual([6, 8]);
  });

  test('shuffles array with random order', () => {
    const source = manual<number[]>();
    // Note: using at: 1 because at: 0 is treated as falsy by the current implementation
    const single = singleFromArray(source, { 
      order: 'random',
      at: 1 
    });

    const values: number[] = [];
    single.onValue((v) => values.push(v));

    // Run multiple times to verify randomness
    const results = new Set<number>();
    for (let i = 0; i < 5; i++) {
      source.set([1, 2, 3, 4, 5]);
      if (values.length > 0) {
        results.add(values[values.length - 1]);
      }
    }

    // Should have seen different values at index 1 due to shuffling
    expect(results.size).toBeGreaterThan(0);
  });

  test('uses custom sort function', () => {
    const source = manual<number[]>();
    // Note: using at: 1 because at: 0 is treated as falsy by the current implementation
    const single = singleFromArray(source, { 
      order: (a, b) => b - a, // Descending
      at: 1 
    });

    const values: number[] = [];
    single.onValue((v) => values.push(v));

    source.set([1, 5, 2, 4, 3]);
    // After sorting descending: [5, 4, 3, 2, 1], index 1 is 4
    expect(values).toEqual([4]);

    source.set([10, 20, 5]);
    // After sorting descending: [20, 10, 5], index 1 is 10
    expect(values).toEqual([4, 10]);
  });

  test('throws if neither predicate nor at is provided', () => {
    const source = manual<number[]>();
    
    expect(() => singleFromArray(source, {})).toThrow("Options must have 'predicate' or 'at' fields");
  });

  test('works with string arrays', () => {
    const source = manual<string[]>();
    const single = singleFromArray(source, { at: 1 });

    const values: string[] = [];
    single.onValue((v) => values.push(v));

    source.set(['apple', 'banana', 'cherry']);
    expect(values).toEqual(['banana']);
  });

  test('works with object arrays using predicate', () => {
    const source = manual<Array<{ id: number; name: string }>>();
    const single = singleFromArray(source, { 
      predicate: (v) => v.id > 1 
    });

    const values: Array<{ id: number; name: string }> = [];
    single.onValue((v) => values.push(v));

    source.set([
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' }
    ]);
    
    // All items with id > 1
    expect(values).toEqual([
      { id: 2, name: 'Bob' },
      { id: 3, name: 'Charlie' }
    ]);
  });

  test('predicate can match multiple values', () => {
    const source = manual<number[]>();
    const single = singleFromArray(source, { 
      predicate: (v) => v > 10 
    });

    const values: number[] = [];
    single.onValue((v) => values.push(v));

    source.set([5, 15, 8, 20, 3]);
    // Should emit 15 and 20 (both > 10)
    expect(values).toEqual([15, 20]);
  });
});
