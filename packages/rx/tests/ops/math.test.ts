import { test, expect, describe } from 'vitest';
import { max, min, average, sum, tally } from '../../src/ops/math.js';
import { manual } from '../../src/index.js';

describe('rx/ops math', () => {
  describe('max', () => {
    test('tracks maximum value', () => {
      const source = manual<number>();
      const maxStream = max(source, {});
      
      const values: number[] = [];
      maxStream.onValue(v => values.push(v as number));
      
      source.set(5);
      source.set(3);
      source.set(8);
      source.set(6);
      
      expect(values).toEqual([5, 8]);
    });

    test('returns annotation when annotate option is true', () => {
      const source = manual<number>();
      const maxStream = max(source, { annotate: true });
      
      const values: Array<{ value: number; max: number }> = [];
      maxStream.onValue(v => values.push(v as { value: number; max: number }));
      
      source.set(5);
      source.set(8);
      
      expect(values[0]).toEqual({ value: 5, max: 5 });
      expect(values[1]).toEqual({ value: 8, max: 8 });
    });
  });

  describe('min', () => {
    test('tracks minimum value', () => {
      const source = manual<number>();
      const minStream = min(source, {});
      
      const values: number[] = [];
      minStream.onValue(v => values.push(v as number));
      
      source.set(8);
      source.set(5);
      source.set(3);
      source.set(6);
      
      expect(values).toEqual([8, 5, 3]);
    });
  });

  describe('average', () => {
    test('calculates running average', () => {
      const source = manual<number>();
      const avgStream = average(source, {});
      
      const values: number[] = [];
      avgStream.onValue(v => values.push(v as number));
      
      source.set(10);
      source.set(20);
      source.set(30);
      
      expect(values[0]).toBe(10);
      expect(values[1]).toBe(15); // (10 + 20) / 2
      expect(values[2]).toBe(20); // (10 + 20 + 30) / 3
    });
  });

  describe('sum', () => {
    test('calculates running sum', () => {
      const source = manual<number>();
      const sumStream = sum(source, {});
      
      const values: number[] = [];
      sumStream.onValue(v => values.push(v as number));
      
      source.set(10);
      source.set(20);
      source.set(30);
      
      expect(values).toEqual([10, 30, 60]);
    });
  });

  describe('tally', () => {
    test('counts items cumulatively', () => {
      const source = manual<number[]>();
      const tallyStream = tally(source, { countArrayItems: true });
      
      const values: number[] = [];
      tallyStream.onValue(v => values.push(v as number));
      
      source.set([1, 2, 3]);
      source.set([4, 5]);
      source.set([6]);
      
      // Tally is cumulative: 3, then 3+2=5, then 5+1=6
      expect(values).toEqual([3, 5, 6]);
    });

    test('counts items without expanding arrays', () => {
      const source = manual<number[]>();
      const tallyStream = tally(source, { countArrayItems: false });
      
      const values: number[] = [];
      tallyStream.onValue(v => values.push(v as number));
      
      source.set([1, 2, 3]);
      source.set([4, 5]);
      
      // Each array counts as 1 item, cumulative: 1, then 2
      expect(values).toEqual([1, 2]);
    });
  });
});
