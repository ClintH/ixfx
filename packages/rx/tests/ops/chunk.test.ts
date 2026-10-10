import { sleep } from '@ixfx/core';
import { describe, expect, it, vi } from 'vitest';
import { manual } from '../../src/index.js';
import { chunk } from '../../src/ops/chunk.js';

describe(`rx/ops/chunk`, () => {
  it(`chunks by quantity`, async () => {
    const source = manual<number>();
    const chunks: number[][] = [];

    const chunked = chunk(source, { quantity: 3 });
    chunked.onValue(v => chunks.push(v));

    source.set(1);
    source.set(2);
    await sleep(10);

    expect(chunks).toEqual([]);

    source.set(3);
    await sleep(10);
    expect(chunks).toEqual([[1, 2, 3]]);

    source.set(4);
    source.set(5);
    await sleep(10);
    expect(chunks).toEqual([[1, 2, 3]]);

    source.set(6);
    await sleep(10);
    expect(chunks).toEqual([[1, 2, 3], [4, 5, 6]]);
  });

  it(`returns remainder on stop by default`, async () => {
    const source = manual<number>();
    const chunks: number[][] = [];

    const chunked = chunk(source, { quantity: 3 });
    chunked.onValue(v => chunks.push(v));

    source.set(1);
    source.set(2);
    await sleep(10);

    expect(chunks).toEqual([]);

    source.dispose(`testing`);
    await sleep(10);
    expect(chunks).toEqual([[1, 2]]);
  });

  it(`does not return remainder when returnRemainder is false`, async () => {
    const source = manual<number>();
    const chunks: number[][] = [];

    const chunked = chunk(source, { quantity: 3, returnRemainder: false });
    chunked.onValue(v => chunks.push(v));

    source.set(1);
    source.set(2);
    source.dispose(`testing`);
    await sleep(10);
    expect(chunks).toEqual([]);
  });

  it(`handles empty source`, async () => {
    const source = manual<number>();
    const chunks: number[][] = [];

    const chunked = chunk(source, { quantity: 3 });
    chunked.onValue(v => chunks.push(v));

    source.dispose(`testing`);
    await sleep(10);
    expect(chunks).toEqual([]);
  });

  it(`chunks arrays as source`, async () => {
    const source = [1, 2, 3, 4, 5, 6, 7];
    const chunked = chunk(source, { quantity: 3 });

    const chunks: number[][] = [];
    chunked.onValue(v => chunks.push(v));

    // Array source emits over several ticks; wait for completion rather
    // than a fixed sleep, which is sensitive to machine load
    await vi.waitFor(() => {
      expect(chunks.length).toBe(3);
    });

    expect(chunks[0]).toEqual([1, 2, 3]);
    expect(chunks[1]).toEqual([4, 5, 6]);
    expect(chunks[2]).toEqual([7]);
  });

  it(`preserves value order within chunks`, async () => {
    const source = manual<string>();
    const chunks: string[][] = [];

    const chunked = chunk(source, { quantity: 2 });
    chunked.onValue(v => chunks.push(v));

    source.set(`a`);
    source.set(`b`);
    await sleep(10);
    expect(chunks).toEqual([[`a`, `b`]]);

    source.set(`c`);
    source.set(`d`);
    await sleep(10);
    expect(chunks).toEqual([
      [`a`, `b`],
      [`c`, `d`],
    ]);
  });

  it(`handles single item quantity`, async () => {
    const source = manual<number>();
    const chunks: number[][] = [];

    const chunked = chunk(source, { quantity: 1 });
    chunked.onValue(v => chunks.push(v));

    source.set(1);
    await sleep(10);
    expect(chunks).toEqual([[1]]);

    source.set(2);
    await sleep(10);
    expect(chunks).toEqual([[1], [2]]);

    source.set(3);
    await sleep(10);
    expect(chunks).toEqual([[1], [2], [3]]);
  });

  it(`handles chunking objects`, async () => {
    const source = manual<{ id: number }>();
    const chunks: Array<Array<{ id: number }>> = [];

    const chunked = chunk(source, { quantity: 2 });
    chunked.onValue(v => chunks.push(v));

    source.set({ id: 1 });
    source.set({ id: 2 });
    await sleep(10);
    expect(chunks.length).toBe(1);
    expect(chunks[0][0].id).toBe(1);
    expect(chunks[0][1].id).toBe(2);

    source.set({ id: 3 });
    await sleep(10);
    expect(chunks.length).toBe(1);
  });
});
