import { describe, test, expect } from 'vitest';
import { split, splitLabelled } from '../../src/ops/split.js';
import { manual } from '../../src/index.js';

describe('rx/ops/split', () => {
  describe('split', () => {
    test('creates specified number of streams', () => {
      const source = manual<number>();
      const streams = split(source, { quantity: 3 });

      expect(streams).toHaveLength(3);
      expect(streams[0]).toBeDefined();
      expect(streams[1]).toBeDefined();
      expect(streams[2]).toBeDefined();
    });

    test('defaults to 2 streams', () => {
      const source = manual<number>();
      const streams = split(source, {});

      expect(streams).toHaveLength(2);
    });

    test('streams are reactive', () => {
      const source = manual<number>();
      const streams = split(source, { quantity: 2 });

      // Should have reactive methods
      expect(typeof streams[0].on).toBe('function');
      expect(typeof streams[0].onValue).toBe('function');
      expect(typeof streams[0].dispose).toBe('function');
      expect(typeof streams[0].isDisposed).toBe('function');
    });

    test('streams dispose when source is done', async () => {
      const source = manual<number>();
      const streams = split(source, { quantity: 2 });

      // Subscribe to activate
      streams[0].on(() => {});
      streams[1].on(() => {});

      source.dispose('done');

      // Give time for disposal to propagate
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(streams[0].isDisposed()).toBe(true);
      expect(streams[1].isDisposed()).toBe(true);
    });
  });

  describe('splitLabelled', () => {
    test('creates labelled streams', () => {
      const source = manual<number>();
      const { a, b, c } = splitLabelled(source, ['a', 'b', 'c']);

      expect(a).toBeDefined();
      expect(b).toBeDefined();
      expect(c).toBeDefined();
    });

    test('works with string labels', () => {
      const source = manual<string>();
      const streams = splitLabelled(source, ['first', 'second']);

      expect(streams.first).toBeDefined();
      expect(streams.second).toBeDefined();
    });

    test('works with symbol labels', () => {
      const source = manual<number>();
      const sym1 = Symbol('stream1');
      const sym2 = Symbol('stream2');
      
      const streams = splitLabelled(source, [sym1, sym2]);

      expect(streams[sym1]).toBeDefined();
      expect(streams[sym2]).toBeDefined();
    });

    test('labelled streams are reactive', () => {
      const source = manual<number>();
      const { x, y } = splitLabelled(source, ['x', 'y']);

      // Should have reactive methods
      expect(typeof x.on).toBe('function');
      expect(typeof x.onValue).toBe('function');
      expect(typeof y.on).toBe('function');
      expect(typeof y.onValue).toBe('function');
    });

    test('labelled streams dispose when source is done', async () => {
      const source = manual<number>();
      const { a, b } = splitLabelled(source, ['a', 'b']);

      // Subscribe to activate
      a.on(() => {});
      b.on(() => {});

      source.dispose('done');

      // Give time for disposal to propagate
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(a.isDisposed()).toBe(true);
      expect(b.isDisposed()).toBe(true);
    });
  });
});
