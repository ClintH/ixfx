import { test, expect, describe } from 'vitest';
import { pipe } from '../../src/ops/pipe.js';
import { manual } from '../../src/index.js';
import { sleep } from '@ixfx/core';

describe('pipe', () => {
  test('pipes values through', async () => {
    const source = manual<number>();
    const piped = pipe(source);
    
    const values: number[] = [];
    piped.onValue(v => values.push(v as number));
    
    source.set(1);
    await sleep(10);
    
    expect(values).toEqual([1]);
  });

  test('pipes multiple values', async () => {
    const source = manual<number>();
    const piped = pipe(source);
    
    const values: number[] = [];
    piped.onValue(v => values.push(v as number));
    
    source.set(1);
    source.set(2);
    source.set(3);
    await sleep(10);
    
    expect(values).toEqual([1, 2, 3]);
  });

  test('passes through different types', async () => {
    const source = manual<string>();
    const piped = pipe(source);
    
    const values: string[] = [];
    piped.onValue(v => values.push(v as string));
    
    source.set('hello');
    await sleep(10);
    
    expect(values).toEqual(['hello']);
  });

  test('handles objects', async () => {
    const source = manual<{ name: string }>();
    const piped = pipe(source);
    
    const values: { name: string }[] = [];
    piped.onValue(v => values.push(v as { name: string }));
    
    source.set({ name: 'test' });
    await sleep(10);
    
    expect(values).toEqual([{ name: 'test' }]);
  });

  test.skip('propagates disposal', async () => {
    // Disposal propagation needs investigation
  });

  test('is disposed when source is disposed', async () => {
    const source = manual<number>();
    const piped = pipe(source);
    
    source.set(1);
    await sleep(10);
    
    expect(piped.isDisposed()).toBe(false);
    
    source.dispose('test');
    await sleep(10);
    
    expect(piped.isDisposed()).toBe(true);
  });

  test('manual disposal', () => {
    const source = manual<number>();
    const piped = pipe(source);
    
    expect(piped.isDisposed()).toBe(false);
    
    piped.dispose('test');
    
    expect(piped.isDisposed()).toBe(true);
  });

  test('handles arrays', async () => {
    const source = manual<number[]>();
    const piped = pipe(source);
    
    const values: number[][] = [];
    piped.onValue(v => values.push(v as number[]));
    
    source.set([1, 2, 3]);
    await sleep(10);
    
    expect(values).toEqual([[1, 2, 3]]);
  });
});
