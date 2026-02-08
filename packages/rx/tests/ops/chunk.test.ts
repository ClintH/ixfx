import { describe, test, expect } from 'vitest';
import { chunk } from '../../src/ops/chunk.js';
import { manual } from '../../src/index.js';
import { sleep } from '@ixfx/core';

describe('rx/ops/chunk', () => {
  test('chunks by quantity', async () => {
    const source = manual<number>();
    const chunks: number[][] = [];

    const chunked = chunk(source, { quantity: 3 });
    chunked.onValue((v) => chunks.push(v));

    source.set(1);
    source.set(2);
    expect(chunks).toEqual([]);

    source.set(3);
    await sleep(0); // Wait for async emit
    expect(chunks).toEqual([[1, 2, 3]]);

    source.set(4);
    source.set(5);
    await sleep(0);
    expect(chunks).toEqual([[1, 2, 3]]);

    source.set(6);
    await sleep(0);
    expect(chunks).toEqual([[1, 2, 3], [4, 5, 6]]);
  });

  test('returns remainder on stop by default', async () => {
    const source = manual<number>();
    const chunks: number[][] = [];

    const chunked = chunk(source, { quantity: 3 });
    chunked.onValue((v) => chunks.push(v));

    source.set(1);
    source.set(2);
    expect(chunks).toEqual([]);

    source.dispose('testing');
    await sleep(0); // Wait for async emit
    expect(chunks).toEqual([[1, 2]]);
  });

  test('does not return remainder when returnRemainder is false', async () => {
    const source = manual<number>();
    const chunks: number[][] = [];

    const chunked = chunk(source, { quantity: 3, returnRemainder: false });
    chunked.onValue((v) => chunks.push(v));

    source.set(1);
    source.set(2);
    source.dispose('testing');
    await sleep(0);
    expect(chunks).toEqual([]);
  });

  test('handles empty source', async () => {
    const source = manual<number>();
    const chunks: number[][] = [];

    const chunked = chunk(source, { quantity: 3 });
    chunked.onValue((v) => chunks.push(v));

    source.dispose('testing');
    await sleep(0);
    expect(chunks).toEqual([]);
  });

  test('chunks arrays as source', async () => {
    const source = [1, 2, 3, 4, 5, 6, 7];
    const chunked = chunk(source, { quantity: 3 });

    const chunks: number[][] = [];
    chunked.onValue((v) => chunks.push(v));
    await sleep(50);

    expect(chunks).toEqual([[1, 2, 3], [4, 5, 6], [7]]);
  });

  test('preserves value order within chunks', async () => {
    const source = manual<string>();
    const chunks: string[][] = [];

    const chunked = chunk(source, { quantity: 2 });
    chunked.onValue((v) => chunks.push(v));

    source.set('a');
    source.set('b');
    await sleep(0);
    expect(chunks).toEqual([['a', 'b']]);

    source.set('c');
    source.set('d');
    await sleep(0);
    expect(chunks).toEqual([
      ['a', 'b'],
      ['c', 'd'],
    ]);
  });

  test('handles single item quantity', async () => {
    const source = manual<number>();
    const chunks: number[][] = [];

    const chunked = chunk(source, { quantity: 1 });
    chunked.onValue((v) => chunks.push(v));

    source.set(1);
    await sleep(0);
    expect(chunks).toEqual([[1]]);

    source.set(2);
    await sleep(0);
    expect(chunks).toEqual([[1], [2]]);

    source.set(3);
    await sleep(0);
    expect(chunks).toEqual([[1], [2], [3]]);
  });

  test('handles chunking objects', async () => {
    const source = manual<{ id: number }>();
    const chunks: Array<Array<{ id: number }>> = [];

    const chunked = chunk(source, { quantity: 2 });
    chunked.onValue((v) => chunks.push(v));

    source.set({ id: 1 });
    source.set({ id: 2 });
    await sleep(0);
    expect(chunks).toEqual([[{ id: 1 }, { id: 2 }]]);

    source.set({ id: 3 });
    await sleep(0);
    expect(chunks).toEqual([[{ id: 1 }, { id: 2 }]]);
  });
});
