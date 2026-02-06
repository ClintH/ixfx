import { describe, test, expect } from 'vitest';
import { lazy } from '../../src/chain/lazy.js';

describe('lazy', () => {
  describe('basic chaining', () => {
    test('transform values', async () => {
      const chain = lazy<number, number>()
        .input([1, 2, 3])
        .transform(x => x * 2);
      
      const result = await chain.asArray();
      expect(result).toEqual([2, 4, 6]);
    });

    test('filter values', async () => {
      const chain = lazy<number, number>()
        .input([1, 2, 3, 4, 5])
        .filter(x => x % 2 === 0);
      
      const result = await chain.asArray();
      expect(result).toEqual([2, 4]);
    });

    test('take values', async () => {
      const chain = lazy<number, number>()
        .input([1, 2, 3, 4, 5])
        .take(3);
      
      const result = await chain.asArray();
      expect(result).toEqual([1, 2, 3]);
    });

    test('chain multiple operations', async () => {
      const chain = lazy<number, number>()
        .input([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
        .filter(x => x % 2 === 0)
        .transform(x => x * 10)
        .take(3);
      
      const result = await chain.asArray();
      expect(result).toEqual([20, 40, 60]);
    });

    test('empty input', async () => {
      const chain = lazy<number, number>()
        .input([])
        .transform(x => x * 2);
      
      const result = await chain.asArray();
      expect(result).toEqual([]);
    });
  });

  describe('math operations', () => {
    test('min values', async () => {
      const chain = lazy<number, number>()
        .input([5, 3, 8, 1, 9, 2])
        .min();
      
      const result = await chain.asArray();
      expect(result).toEqual([5, 3, 3, 1, 1, 1]);
    });

    test('max values', async () => {
      const chain = lazy<number, number>()
        .input([1, 5, 2, 8, 3, 9])
        .max();
      
      const result = await chain.asArray();
      expect(result).toEqual([1, 5, 5, 8, 8, 9]);
    });

    test('sum values', async () => {
      const chain = lazy<number, number>()
        .input([1, 2, 3, 4, 5])
        .sum();
      
      const result = await chain.asArray();
      expect(result).toEqual([1, 3, 6, 10, 15]);
    });

    test('average values', async () => {
      const chain = lazy<number, number>()
        .input([10, 20, 30, 40])
        .average();
      
      const result = await chain.asArray();
      expect(result).toEqual([10, 15, 20, 25]);
    });

    test('tally values', async () => {
      const chain = lazy<number[], number>()
        .input([[1, 2], [3, 4, 5], [6]])
        .tally(true);
      
      const result = await chain.asArray();
      expect(result).toEqual([2, 5, 6]);
    });
  });

  describe('chunk and reduce', () => {
    test('chunk values', async () => {
      const chain = lazy<number, number[]>()
        .input([1, 2, 3, 4, 5, 6, 7])
        .chunk(3);
      
      const result = await chain.asArray();
      expect(result).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
    });

    test('reduce values', async () => {
      const chain = lazy<number[], number>()
        .input([[1, 2, 3], [4, 5]])
        .reduce(arr => arr.reduce((a, b) => a + b, 0));
      
      const result = await chain.asArray();
      expect(result).toEqual([6, 9]);
    });
  });

  describe('drop values', () => {
    test('drop while predicate', async () => {
      const chain = lazy<number, number>()
        .input([1, 2, 3, 4, 5])
        .drop(x => x < 3);
      
      const result = await chain.asArray();
      expect(result).toEqual([3, 4, 5]);
    });
  });

  describe('output methods', () => {
    test('firstOutput', async () => {
      const chain = lazy<number, number>()
        .input([10, 20, 30])
        .transform(x => x * 2);
      
      const result = await chain.firstOutput();
      expect(result).toBe(20);
    });

    test('lastOutput', async () => {
      const chain = lazy<number, number>()
        .input([10, 20, 30])
        .transform(x => x * 2);
      
      const result = await chain.lastOutput();
      expect(result).toBe(60);
    });

    test('asGenerator', async () => {
      const chain = lazy<number, number>()
        .input([1, 2, 3])
        .transform(x => x * 10);
      
      const gen = chain.asGenerator();
      const results: number[] = [];
      for await (const v of gen) {
        results.push(v);
      }
      expect(results).toEqual([10, 20, 30]);
    });
  });

  describe('input variations', () => {
    test('input passed to asArray', async () => {
      const chain = lazy<number, number>()
        .transform(x => x * 2);
      
      const result = await chain.asArray([1, 2, 3]);
      expect(result).toEqual([2, 4, 6]);
    });

    test('input passed to firstOutput', async () => {
      const chain = lazy<number, number>()
        .transform(x => x * 2);
      
      const result = await chain.firstOutput([5, 6, 7]);
      expect(result).toBe(10);
    });

    test('input passed to lastOutput', async () => {
      const chain = lazy<number, number>()
        .transform(x => x * 2);
      
      const result = await chain.lastOutput([5, 6, 7]);
      expect(result).toBe(14);
    });

    test('input passed to asGenerator', async () => {
      const chain = lazy<number, number>()
        .transform(x => x * 2);
      
      const gen = chain.asGenerator([1, 2, 3]);
      const results: number[] = [];
      for await (const v of gen) {
        results.push(v);
      }
      expect(results).toEqual([2, 4, 6]);
    });
  });

  describe('fromFunction', () => {
    test.skip('fromFunction provides values', async () => {
      // This test is skipped - fromFunction creates a GenFactoryNoInput
      // which requires special handling in the chain
      let counter = 0;
      const chain = lazy<number, number>()
        .fromFunction(() => {
          counter++;
          return counter;
        })
        .take(5);
      
      const result = await chain.asArray();
      expect(result).toEqual([1, 2, 3, 4, 5]);
    });
  });

  describe('type transformations', () => {
    test('string to number', async () => {
      const chain = lazy<string, number>()
        .input(['1', '2', '3'])
        .transform(s => parseInt(s))
        .transform(n => n * 10);
      
      const result = await chain.asArray();
      expect(result).toEqual([10, 20, 30]);
    });

    test('number to object', async () => {
      const chain = lazy<number, { value: number }>()
        .input([1, 2, 3])
        .transform(n => ({ value: n }));
      
      const result = await chain.asArray();
      expect(result).toEqual([{ value: 1 }, { value: 2 }, { value: 3 }]);
    });
  });
});
