import { describe, test, expect } from 'vitest';
import { resolveSource } from '../src/resolve-source.js';
import { initStream } from '../src/init-stream.js';
import { isReactive, isWrapped } from '../src/util.js';
import type { Wrapped } from '../src/types.js';

describe('rx/resolve-source', () => {
  describe('resolveSource', () => {
    test('returns reactive as-is', () => {
      const reactive = initStream<number>();
      const resolved = resolveSource(reactive);
      expect(resolved).toBe(reactive);
    });

    test('resolves arrays to iterator', () => {
      const source = [1, 2, 3];
      const resolved = resolveSource(source);
      expect(isReactive(resolved)).toBe(true);
    });

    test('resolves iterables', () => {
      function* gen() {
        yield 1;
        yield 2;
        yield 3;
      }
      const resolved = resolveSource(gen());
      expect(isReactive(resolved)).toBe(true);
    });

    test('resolves functions', () => {
      const fn = () => 'test value';
      const resolved = resolveSource(fn);
      expect(isReactive(resolved)).toBe(true);
    });

    test('resolves wrapped sources', () => {
      const reactive = initStream<string>();
      const wrapped = {
        source: reactive,
        annotate: () => wrapped as any,
        annotateWithOp: () => wrapped as any,
        chunk: () => wrapped as any,
        debounce: () => wrapped as any,
        field: () => wrapped as any,
        filter: () => wrapped as any,
        combineLatestToArray: () => wrapped as any,
        combineLatestToObject: () => wrapped as any,
        min: () => wrapped as any,
        max: () => wrapped as any,
        average: () => wrapped as any,
        sum: () => wrapped as any,
        tally: () => wrapped as any,
        split: () => [wrapped] as any,
        syncToArray: () => wrapped as any,
        syncToObject: () => wrapped as any,
        switcher: () => ({}) as any,
        enacts: {} as any
      };
      expect(isWrapped(wrapped)).toBe(true);
      const resolved = resolveSource(wrapped as any);
      expect(resolved).toBe(reactive);
    });

    test('throws for unsupported types', () => {
      expect(() => resolveSource(null as any)).toThrow(TypeError);
      expect(() => resolveSource(undefined as any)).toThrow(TypeError);
      expect(() => resolveSource(123 as any)).toThrow(TypeError);
      expect(() => resolveSource('string' as any)).toThrow(TypeError);
    });

    test('passes through generator options', () => {
      const source = [1, 2, 3];
      const resolved = resolveSource(source, {
        generator: { lazy: 'very', readInterval: 10 } as any
      });
      expect(isReactive(resolved)).toBe(true);
    });

    test('passes through function options', () => {
      const fn = () => 'test';
      const resolved = resolveSource(fn, {
        function: { lazy: 'initial' } as any
      });
      expect(isReactive(resolved)).toBe(true);
    });

    test('resolves Set as iterable', () => {
      const set = new Set([1, 2, 3]);
      const resolved = resolveSource(set as any);
      expect(isReactive(resolved)).toBe(true);
    });

    test('resolves Map as iterable', () => {
      const map = new Map([['a', 1], ['b', 2]]);
      const resolved = resolveSource(map as any);
      expect(isReactive(resolved)).toBe(true);
    });
  });
});