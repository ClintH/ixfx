import { describe, test, expect } from 'vitest';
import { switcher } from '../../src/ops/switcher.js';
import { manual } from '../../src/index.js';

describe('rx/ops/switcher', () => {
  test('routes values to matching output streams', () => {
    const source = manual<number>();
    const switched = switcher(source, {
      even: (v) => v % 2 === 0,
      odd: (v) => v % 2 !== 0
    });

    const evens: number[] = [];
    const odds: number[] = [];

    switched.even.onValue((v) => evens.push(v));
    switched.odd.onValue((v) => odds.push(v));

    source.set(1);
    source.set(2);
    source.set(3);
    source.set(4);

    expect(evens).toEqual([2, 4]);
    expect(odds).toEqual([1, 3]);
  });

  test('defaults to first match only', () => {
    const source = manual<number>();
    const switched = switcher(source, {
      positive: (v) => v > 0,
      even: (v) => v % 2 === 0
    });

    const positives: number[] = [];
    const evens: number[] = [];

    switched.positive.onValue((v) => positives.push(v));
    switched.even.onValue((v) => evens.push(v));

    // 2 is both positive and even, but should only go to 'positive' (first match)
    source.set(2);
    source.set(-2);
    source.set(3);

    expect(positives).toEqual([2, 3]);
    expect(evens).toEqual([-2]); // -2 is not positive, but is even
  });

  test('can match all with match:all option', () => {
    const source = manual<number>();
    const switched = switcher(source, {
      positive: (v) => v > 0,
      even: (v) => v % 2 === 0
    }, { match: 'all' });

    const positives: number[] = [];
    const evens: number[] = [];

    switched.positive.onValue((v) => positives.push(v));
    switched.even.onValue((v) => evens.push(v));

    // 2 is both positive and even, should go to both
    source.set(2);
    source.set(-2);
    source.set(3);

    expect(positives).toEqual([2, 3]);
    expect(evens).toEqual([2, -2]); // 2 now goes to both
  });

  test('disposes all streams when source completes', () => {
    const source = manual<number>();
    const switched = switcher(source, {
      a: () => true,
      b: () => true
    });

    switched.a.on(() => {});
    switched.b.on(() => {});

    expect(switched.a.isDisposed()).toBe(false);
    expect(switched.b.isDisposed()).toBe(false);

    source.dispose('done');

    expect(switched.a.isDisposed()).toBe(true);
    expect(switched.b.isDisposed()).toBe(true);
  });

  test('works with string values', () => {
    const source = manual<string>();
    const switched = switcher(source, {
      long: (v) => v.length > 5,
      short: (v) => v.length <= 5
    });

    const longs: string[] = [];
    const shorts: string[] = [];

    switched.long.onValue((v) => longs.push(v));
    switched.short.onValue((v) => shorts.push(v));

    source.set('hi');
    source.set('hello');
    source.set('worldwide');
    source.set('test');

    expect(longs).toEqual(['worldwide']);
    expect(shorts).toEqual(['hi', 'hello', 'test']);
  });

  test('works with object values', () => {
    const source = manual<{ type: string; value: number }>();
    const switched = switcher(source, {
      typeA: (v) => v.type === 'A',
      typeB: (v) => v.type === 'B'
    });

    const typeAs: Array<{ type: string; value: number }> = [];
    const typeBs: Array<{ type: string; value: number }> = [];

    switched.typeA.onValue((v) => typeAs.push(v));
    switched.typeB.onValue((v) => typeBs.push(v));

    source.set({ type: 'A', value: 1 });
    source.set({ type: 'B', value: 2 });
    source.set({ type: 'A', value: 3 });

    expect(typeAs).toEqual([
      { type: 'A', value: 1 },
      { type: 'A', value: 3 }
    ]);
    expect(typeBs).toEqual([{ type: 'B', value: 2 }]);
  });

  test('handles values that match no cases', () => {
    const source = manual<number>();
    const switched = switcher(source, {
      positive: (v) => v > 0
    });

    const positives: number[] = [];
    switched.positive.onValue((v) => positives.push(v));

    source.set(-1);
    source.set(0);
    source.set(1);
    source.set(-5);

    expect(positives).toEqual([1]);
  });

  test('supports many output streams', () => {
    const source = manual<number>();
    const switched = switcher(source, {
      zero: (v) => v === 0,
      one: (v) => v === 1,
      two: (v) => v === 2,
      three: (v) => v === 3,
      other: (v) => v > 3
    });

    const results: Record<string, number[]> = {
      zero: [],
      one: [],
      two: [],
      three: [],
      other: []
    };

    switched.zero.onValue((v) => results.zero.push(v));
    switched.one.onValue((v) => results.one.push(v));
    switched.two.onValue((v) => results.two.push(v));
    switched.three.onValue((v) => results.three.push(v));
    switched.other.onValue((v) => results.other.push(v));

    source.set(0);
    source.set(1);
    source.set(2);
    source.set(5);

    expect(results.zero).toEqual([0]);
    expect(results.one).toEqual([1]);
    expect(results.two).toEqual([2]);
    expect(results.three).toEqual([]);
    expect(results.other).toEqual([5]);
  });
});
