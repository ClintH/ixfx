import { describe, test, expect, vi } from 'vitest';
import { transform } from '../../src/ops/transform.js';
import { manual } from '../../src/index.js';
import { toArray } from '../../src/to-array.js';

describe('rx/ops/transform', () => {
  test('transforms values', async () => {
    const source = manual<number>();
    const values: number[] = [];

    const transformed = transform(source, (v) => v * 2);
    transformed.onValue(v => values.push(v));

    source.set(1);
    source.set(2);
    source.set(3);

    expect(values).toEqual([2, 4, 6]);
  });

  test('transforms types', () => {
    const source = manual<number>();
    const values: string[] = [];

    const transformed = transform(source, (v) => `value: ${v}`);
    transformed.onValue(v => values.push(v));

    source.set(42);
    source.set(100);

    expect(values).toEqual(['value: 42', 'value: 100']);
  });

  test('works with arrays', async () => {
    const source = [1, 2, 3, 4, 5];
    const transformed = transform(source, (v) => v * 10);
    
    const values = await toArray(transformed);
    expect(values).toEqual([10, 20, 30, 40, 50]);
  });

  test('transforms objects', () => {
    const source = manual<{ x: number; y: number }>();
    const values: string[] = [];

    const transformed = transform(source, (v) => `${v.x},${v.y}`);
    transformed.onValue(v => values.push(v));

    source.set({ x: 10, y: 20 });
    source.set({ x: 30, y: 40 });

    expect(values).toEqual(['10,20', '30,40']);
  });

  test('handles async-like transformations', () => {
    const source = manual<number>();
    const values: string[] = [];

    const transformed = transform(source, (v) => {
      if (v < 0) return 'negative';
      if (v === 0) return 'zero';
      return 'positive';
    });

    transformed.onValue(v => values.push(v));

    source.set(-5);
    source.set(0);
    source.set(10);

    expect(values).toEqual(['negative', 'zero', 'positive']);
  });

  test('traceInput logs input values', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const source = manual<number>();

    const transformed = transform(source, (v) => v * 2, { traceInput: true });
    transformed.onValue(() => {});

    source.set(5);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('input'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('5'));

    consoleSpy.mockRestore();
  });

  test('traceOutput logs output values', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const source = manual<number>();

    const transformed = transform(source, (v) => v * 2, { traceOutput: true });
    transformed.onValue(() => {});

    source.set(5);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('output'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('10'));

    consoleSpy.mockRestore();
  });

  test('traceInput and traceOutput together log both', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const source = manual<number>();

    const transformed = transform(source, (v) => v * 2, { 
      traceInput: true, 
      traceOutput: true 
    });
    transformed.onValue(() => {});

    source.set(3);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('input'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('output'));

    consoleSpy.mockRestore();
  });

  test('chains with other operators', () => {
    const source = manual<number>();
    const values: number[] = [];

    const doubled = transform(source, (v) => v * 2);
    const stringified = transform(doubled, (v) => v.toString());
    const parsed = transform(stringified, (v) => parseInt(v));

    parsed.onValue(v => values.push(v));

    source.set(5);
    source.set(10);

    expect(values).toEqual([10, 20]);
  });

  test('handles empty arrays', async () => {
    const source: number[] = [];
    const transformed = transform(source, (v) => v * 2);
    
    const values = await toArray(transformed);
    expect(values).toEqual([]);
  });

  test('preserves all values', () => {
    const source = manual<string>();
    const values: string[] = [];

    const transformed = transform(source, (v) => v.toUpperCase());
    transformed.onValue(v => values.push(v));

    source.set('hello');
    source.set('world');
    source.set('test');

    expect(values).toEqual(['HELLO', 'WORLD', 'TEST']);
  });
});