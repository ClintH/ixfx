import { describe, test, expect } from 'vitest';
import { run, runN } from '../../src/chain/run.js';
import { transform, filter, take } from '../../src/chain/links.js';
import { asyncIterableToArray } from '../test-utils.js';

describe('run', () => {
  test('runs with just source data', async () => {
    const gen = run([1, 2, 3]);
    const result = await asyncIterableToArray(gen);
    expect(result).toEqual([1, 2, 3]);
  });

  test('runs with source and one transform', async () => {
    const gen = run(
      [1, 2, 3],
      transform((x: number) => x * 2)
    );
    const result = await asyncIterableToArray(gen);
    expect(result).toEqual([2, 4, 6]);
  });

  test('runs with source and multiple transforms', async () => {
    const gen = run(
      [1, 2, 3, 4, 5],
      transform((x: number) => x * 2),
      filter((x: number) => x > 4),
      take(2)
    );
    const result = await asyncIterableToArray(gen);
    expect(result).toEqual([6, 8]);
  });

  test('handles empty source', async () => {
    const gen = run([]);
    const result = await asyncIterableToArray(gen);
    expect(result).toEqual([]);
  });

  test('handles type transformation', async () => {
    const gen = run(
      ['1', '2', '3'],
      transform((x: string) => parseInt(x))
    );
    const result = await asyncIterableToArray(gen);
    expect(result).toEqual([1, 2, 3]);
  });

  test('chains multiple type transformations', async () => {
    const gen = run(
      ['1', '2', '3'],
      transform((x: string) => parseInt(x)),
      transform((x: number) => x * 10),
      transform((x: number) => x.toString())
    );
    const result = await asyncIterableToArray(gen);
    expect(result).toEqual(['10', '20', '30']);
  });
});

describe('runN', () => {
  test('runs with source and identity transform', async () => {
    const gen = runN<number, number>(
      [1, 2, 3],
      transform((x: number) => x)
    );
    const result = await asyncIterableToArray(gen);
    expect(result).toEqual([1, 2, 3]);
  });

  test('runs with source and one transform', async () => {
    const gen = runN<number, number>(
      [1, 2, 3],
      transform((x: number) => x * 2)
    );
    const result = await asyncIterableToArray(gen);
    expect(result).toEqual([2, 4, 6]);
  });

  test('runs with source and multiple transforms', async () => {
    const gen = runN<number, number>(
      [1, 2, 3, 4, 5],
      transform((x: number) => x * 2),
      filter((x: number) => x > 4),
      take(2)
    );
    const result = await asyncIterableToArray(gen);
    expect(result).toEqual([6, 8]);
  });
});
