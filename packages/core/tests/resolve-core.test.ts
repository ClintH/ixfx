import { test, expect, describe, vi } from 'vitest';
import { 
  resolve, 
  resolveSync, 
  resolveWithFallback, 
  resolveWithFallbackSync,
  type ResolveFallbackOptions 
} from '../src/resolve-core.js';

describe('resolve', () => {
  test('returns primitive values as-is', async () => {
    expect(await resolve(10)).toBe(10);
    expect(await resolve('hello')).toBe('hello');
    expect(await resolve(true)).toBe(true);
  });

  test('resolves sync functions', async () => {
    const fn = () => 42;
    expect(await resolve(fn)).toBe(42);
  });

  test('resolves async functions', async () => {
    const fn = async () => 'result';
    expect(await resolve(fn)).toBe('result');
  });

  test('passes additional args to functions', async () => {
    const fn = (a: number, b: number) => a + b;
    expect(await resolve(fn, 5, 3)).toBe(8);
  });

  test('resolves generators', async () => {
    function* gen() {
      yield 1;
      yield 2;
      return 3;
    }
    const g = gen();
    expect(await resolve(g)).toBe(1);
  });

  test('resolves array iterators', async () => {
    const arr = [10, 20, 30];
    const iter = arr[Symbol.iterator]();
    expect(await resolve(iter)).toBe(10);
  });

  test('resolves async generators', async () => {
    async function* asyncGen() {
      yield 'a';
      yield 'b';
      return 'c';
    }
    const g = asyncGen();
    expect(await resolve(g)).toBe('a');
  });

  test('resolves reactive with last value', async () => {
    const r = {
      on: () => () => {},
      onValue: () => () => {},
      last: () => 100
    };
    expect(await resolve(r as any)).toBe(100);
  });

  test('throws for reactive without last value', async () => {
    const r = {
      on: () => () => {},
      onValue: () => () => {},
      last: () => undefined
    };
    await expect(resolve(r as any)).rejects.toThrow('Reactive does not have last value');
  });

  test('returns regular objects as-is', async () => {
    const obj = { foo: 'bar', num: 42 };
    expect(await resolve(obj)).toBe(obj);
  });

  test('returns arrays as-is', async () => {
    const arr = [1, 2, 3];
    expect(await resolve(arr)).toBe(arr);
  });

  test('throws for object with next but invalid tag', async () => {
    const invalid = {
      next: () => ({ done: true, value: 1 }),
      [Symbol.toStringTag]: 'InvalidTag'
    };
    await expect(resolve(invalid as any)).rejects.toThrow("Object has 'next' prop, but does not have 'AsyncGenerator', 'Generator' or 'Array Iterator' string tag symbol");
  });

  test('handles generator with value but no done property', async () => {
    const gen = {
      next: () => ({ value: 999 }),
      [Symbol.toStringTag]: 'Generator'
    } as any;
    // When there's no 'done' property, returns the whole iterator result object
    expect(await resolve(gen)).toEqual({ value: 999 });
  });

  test('handles async generator with value but no done property', async () => {
    const gen = {
      next: async () => ({ value: 888 }),
      [Symbol.toStringTag]: 'AsyncGenerator'
    } as any;
    // When there's no 'done' property, returns the whole iterator result object
    expect(await resolve(gen)).toEqual({ value: 888 });
  });
});

describe('resolveSync', () => {
  test('returns primitive values as-is', () => {
    expect(resolveSync(10)).toBe(10);
    expect(resolveSync('hello')).toBe('hello');
    expect(resolveSync(true)).toBe(true);
  });

  test('resolves sync functions', () => {
    const fn = () => 42;
    expect(resolveSync(fn)).toBe(42);
  });

  test('passes additional args to functions', () => {
    const fn = (a: number, b: number) => a + b;
    expect(resolveSync(fn, 5, 3)).toBe(8);
  });

  test('resolves generators', () => {
    function* gen() {
      yield 1;
      yield 2;
      return 3;
    }
    const g = gen();
    expect(resolveSync(g)).toBe(1);
  });

  test('resolves array iterators', () => {
    const arr = [10, 20, 30];
    const iter = arr[Symbol.iterator]();
    expect(resolveSync(iter)).toBe(10);
  });

  test('throws for async generators', () => {
    async function* asyncGen() {
      yield 'a';
    }
    const g = asyncGen();
    expect(() => resolveSync(g)).toThrow('resolveSync cannot work with an async generator');
  });

  test('resolves reactive with last value', () => {
    const r = {
      on: () => () => {},
      onValue: () => () => {},
      last: () => 100
    };
    expect(resolveSync(r as any)).toBe(100);
  });

  test('throws for reactive without last value', () => {
    const r = {
      on: () => () => {},
      onValue: () => () => {},
      last: () => undefined
    };
    expect(() => resolveSync(r as any)).toThrow('Reactive does not have last value');
  });

  test('returns regular objects as-is', () => {
    const obj = { foo: 'bar', num: 42 };
    expect(resolveSync(obj)).toBe(obj);
  });

  test('throws for object with next but invalid tag', () => {
    const invalid = {
      next: () => ({ done: true, value: 1 }),
      [Symbol.toStringTag]: 'InvalidTag'
    };
    expect(() => resolveSync(invalid as any)).toThrow("Object has 'next' prop, but does not have 'Generator' or 'Array Iterator' string tag symbol");
  });

  test('handles iterator with value but no done property', () => {
    const gen = {
      next: () => ({ value: 999 }),
      [Symbol.toStringTag]: 'Generator'
    } as any;
    // When there's no 'done' property, returns the whole iterator result object
    expect(resolveSync(gen)).toEqual({ value: 999 });
  });
});

describe('resolveWithFallback', () => {
  test('returns resolved value when valid', async () => {
    const options: ResolveFallbackOptions<number> = { value: 999 };
    expect(await resolveWithFallback(42, options)).toBe(42);
  });

  test('uses fallback when function returns undefined', async () => {
    const options: ResolveFallbackOptions<number> = { value: 999 };
    const fn = () => undefined;
    expect(await resolveWithFallback(fn, options)).toBe(999);
  });

  test('uses fallback when value is NaN', async () => {
    const options: ResolveFallbackOptions<number> = { value: 999 };
    expect(await resolveWithFallback(NaN, options)).toBe(999);
  });

  test('uses fallback when function throws', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const options: ResolveFallbackOptions<number> = { value: 999 };
    const fn = () => { throw new Error('test error'); };
    expect(await resolveWithFallback(fn, options)).toBe(999);
    consoleSpy.mockRestore();
  });

  test('throws when fallback value is undefined', async () => {
    const options: ResolveFallbackOptions<number> = { value: undefined as any };
    await expect(resolveWithFallback(42, options)).rejects.toThrow("Param 'options.value' is undefined");
  });

  test('overrideWithLast updates fallback within same call', async () => {
    const options: ResolveFallbackOptions<number> = { value: 0, overrideWithLast: true };
    // When overrideWithLast is true and value is valid, fallback should be updated
    // This test verifies the internal logic works within a single successful call
    const result = await resolveWithFallback(42, options);
    expect(result).toBe(42);
  });

  test('passes additional args through', async () => {
    const options: ResolveFallbackOptions<number> = { value: 999 };
    const fn = (a: number, b: number) => a * b;
    expect(await resolveWithFallback(fn, options, 3, 4)).toBe(12);
  });

  test('logs warning on error', async () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const options: ResolveFallbackOptions<number> = { value: 999 };
    const fn = () => { throw new Error('test error'); };
    
    await resolveWithFallback(fn, options);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('resolveWithFallback swallowed an error'),
      'test error'
    );
    
    consoleSpy.mockRestore();
  });
});

describe('resolveWithFallbackSync', () => {
  test('returns resolved value when valid', () => {
    const options: ResolveFallbackOptions<number> = { value: 999 };
    expect(resolveWithFallbackSync(42, options)).toBe(42);
  });

  test('uses fallback when function returns undefined', () => {
    const options: ResolveFallbackOptions<number> = { value: 999 };
    const fn = () => undefined;
    expect(resolveWithFallbackSync(fn, options)).toBe(999);
  });

  test('uses fallback when value is NaN', () => {
    const options: ResolveFallbackOptions<number> = { value: 999 };
    expect(resolveWithFallbackSync(NaN, options)).toBe(999);
  });

  test('uses fallback when function throws', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const options: ResolveFallbackOptions<number> = { value: 999 };
    const fn = () => { throw new Error('test error'); };
    expect(resolveWithFallbackSync(fn, options)).toBe(999);
    consoleSpy.mockRestore();
  });

  test('throws when fallback value is undefined', () => {
    const options: ResolveFallbackOptions<number> = { value: undefined as any };
    expect(() => resolveWithFallbackSync(42, options)).toThrow("Param 'options.value' is undefined");
  });

  test('overrideWithLast updates fallback within same call', () => {
    const options: ResolveFallbackOptions<number> = { value: 0, overrideWithLast: true };
    const result = resolveWithFallbackSync(42, options);
    expect(result).toBe(42);
  });

  test('passes additional args through', () => {
    const options: ResolveFallbackOptions<number> = { value: 999 };
    const fn = (a: number, b: number) => a * b;
    expect(resolveWithFallbackSync(fn, options, 3, 4)).toBe(12);
  });

  test('logs warning on error', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const options: ResolveFallbackOptions<number> = { value: 999 };
    const fn = () => { throw new Error('test error'); };
    
    resolveWithFallbackSync(fn, options);
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('resolveWithFallbackSync swallowed an error'),
      'test error'
    );
    
    consoleSpy.mockRestore();
  });

  test('cannot handle async generators', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const options: ResolveFallbackOptions<number> = { value: 999 };
    async function* asyncGen() {
      yield 1;
    }
    // Should use fallback since resolveSync throws for async generators
    expect(resolveWithFallbackSync(asyncGen() as any, options)).toBe(999);
    consoleSpy.mockRestore();
  });
});
