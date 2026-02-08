import { describe, test, expect } from 'vitest';
import { computeWithPrevious } from '../../src/ops/compute-with-previous.js';
import { manual } from '../../src/index.js';

describe('rx/ops/compute-with-previous', () => {
  test('emits first value as-is', () => {
    const source = manual<number>();
    const computed = computeWithPrevious(source, (prev, curr) => prev + curr);

    const values: number[] = [];
    computed.onValue((v) => values.push(v));

    source.set(10);
    expect(values).toEqual([10]);
  });

  test('computes using previous and current value', () => {
    const source = manual<number>();
    const computed = computeWithPrevious(source, (prev, curr) => prev + curr);

    const values: number[] = [];
    computed.onValue((v) => values.push(v));

    source.set(10);
    source.set(20);
    // prev=10, curr=20, result=30
    expect(values).toEqual([10, 30]);

    source.set(5);
    // prev=30, curr=5, result=35
    expect(values).toEqual([10, 30, 35]);
  });

  test('supports different computation functions', () => {
    const source = manual<number>();
    const computed = computeWithPrevious(source, (prev, curr) => curr - prev);

    const values: number[] = [];
    computed.onValue((v) => values.push(v));

    source.set(100);
    source.set(50);
    // prev=100, curr=50, result=50-100=-50
    expect(values[1]).toBe(-50);
  });

  test('is pingable', () => {
    const source = manual<number>();
    const computed = computeWithPrevious(source, (prev, curr) => prev + curr);

    expect(typeof computed.ping).toBe('function');
  });

  test('ping triggers computation', () => {
    const source = manual<number>();
    const computed = computeWithPrevious(source, (prev, curr) => prev + curr);

    const values: number[] = [];
    computed.onValue((v) => values.push(v));

    source.set(10);
    source.set(20);
    expect(values).toEqual([10, 30]);

    // Ping should compute again with same target
    computed.ping();
    // prev=30, curr=20, result=50
    expect(values[2]).toBe(50);

    computed.ping();
    // prev=50, curr=20, result=70
    expect(values[3]).toBe(70);
  });

  test('ping does nothing if no current value', () => {
    const source = manual<number>();
    const computed = computeWithPrevious(source, (prev, curr) => prev + curr);

    const values: number[] = [];
    computed.onValue((v) => values.push(v));

    // No values set yet, ping should not emit
    computed.ping();
    expect(values).toEqual([]);
  });

  test('works with strings', () => {
    const source = manual<string>();
    const computed = computeWithPrevious(source, (prev, curr) => prev + ' -> ' + curr);

    const values: string[] = [];
    computed.onValue((v) => values.push(v));

    source.set('a');
    source.set('b');
    source.set('c');

    expect(values).toEqual(['a', 'a -> b', 'a -> b -> c']);
  });

  test('maintains separate state per instance', () => {
    const source1 = manual<number>();
    const source2 = manual<number>();
    
    const computed1 = computeWithPrevious(source1, (prev, curr) => prev + curr);
    const computed2 = computeWithPrevious(source2, (prev, curr) => prev * curr);

    const values1: number[] = [];
    const values2: number[] = [];

    computed1.onValue((v) => values1.push(v));
    computed2.onValue((v) => values2.push(v));

    source1.set(10);
    source1.set(20);

    source2.set(10);
    source2.set(20);

    expect(values1).toEqual([10, 30]); // 10 + 20 = 30
    expect(values2).toEqual([10, 200]); // 10 * 20 = 200
  });
});
