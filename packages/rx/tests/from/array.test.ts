import { describe, test, expect } from 'vitest';
import { array, of } from '../../src/from/array.js';
import { toArray } from '../../src/to-array.js';

describe('rx/from/array', () => {
  describe('array', () => {
    test('emits all values from array', async () => {
      const source = [1, 2, 3, 4, 5];
      const rx = array(source);
      
      const values = await toArray(rx);
      expect(values).toEqual([1, 2, 3, 4, 5]);
    });

    test('emits string values', async () => {
      const source = ['a', 'b', 'c'];
      const rx = array(source);
      
      const values = await toArray(rx);
      expect(values).toEqual(['a', 'b', 'c']);
    });

    test('last() returns most recent value', async () => {
      const source = [10, 20, 30];
      const rx = array(source);
      
      // Need to subscribe and wait for values
      const values: number[] = [];
      rx.onValue(v => values.push(v));
      
      // Wait for async processing
      await new Promise(r => setTimeout(r, 50));
      
      expect(rx.last()).toBe(30);
    });

    test('isDone() returns true when array exhausted', async () => {
      const source = [1, 2];
      const rx = array(source);
      
      expect(rx.isDone()).toBe(false);
      
      // Consume all values
      await toArray(rx);
      
      expect(rx.isDone()).toBe(true);
    });

    test('creates independent copy of array', async () => {
      const source = [1, 2, 3];
      const rx = array(source);
      
      // Modify original
      source.push(4);
      
      const values = await toArray(rx);
      // Should not include the pushed value
      expect(values).toEqual([1, 2, 3]);
    });



    test('handles single element', async () => {
      const source = [42];
      const rx = array(source);
      
      const values = await toArray(rx);
      expect(values).toEqual([42]);
    });

    test('disposes after completing', async () => {
      const source = [1, 2];
      const rx = array(source);
      
      expect(rx.isDisposed()).toBe(false);
      
      await toArray(rx);
      
      expect(rx.isDisposed()).toBe(true);
    });


  });

  describe('of', () => {
    test('creates array reactive from array', async () => {
      const source = [1, 2, 3];
      const rx = of(source);
      
      expect(rx).toBeDefined();
      const values = await toArray(rx!);
      expect(values).toEqual([1, 2, 3]);
    });

    test('returns undefined for non-array iterables', () => {
      function* gen() {
        yield 1;
        yield 2;
      }
      
      const rx = of(gen());
      expect(rx).toBeUndefined();
    });


  });
});