import { describe, expect, it, vi } from 'vitest';
import { prepare } from '../src/graph.js';
import { manual } from '../src/index.js';
import * as Rx from '../src/index.js';
import { tapOps, tapProcess } from '../src/ops/tap.js';
import { debounce } from '../src/reactives/debounce.js';
import { toGenerator } from '../src/to-generator.js';
import { wrap } from '../src/wrap.js';

describe(`rx/wrap`, () => {
  it(`math ops`, async () => {
    const source = manual<number>();
    const w = wrap(source);

    const sums: number[] = [];
    w.sum().onValue(v => sums.push(v));
    const averages: number[] = [];
    w.average().onValue(v => averages.push(v));
    const tallies: number[] = [];
    w.tally().onValue(v => tallies.push(v));

    source.set(2);
    source.set(4);
    await vi.waitFor(() => {
      expect(sums.length).toBe(2);
    });
    expect(sums).toEqual([2, 6]);
    expect(averages).toEqual([2, 3]);
    expect(tallies).toEqual([1, 2]);
  });

  it(`field extracts a property`, async () => {
    const source = manual<{ name: string; value: number }>();
    const names: string[] = [];
    wrap(source).field(`name`).onValue(v => names.push(v));
    source.set({ name: `a`, value: 1 });
    source.set({ name: `b`, value: 2 });
    await vi.waitFor(() => {
      expect(names.length).toBe(2);
    });
    expect(names).toEqual([`a`, `b`]);
  });

  it(`tapStream duplicates values to a diverged stream`, async () => {
    const source = manual<number>();
    const diverged = manual<number>();
    const divergedSeen: number[] = [];
    diverged.onValue(v => divergedSeen.push(v));

    const passthrough: number[] = [];
    wrap(source).tapStream(diverged).onValue(v => passthrough.push(v));

    source.set(5);
    source.set(6);
    await vi.waitFor(() => {
      expect(divergedSeen.length).toBe(2);
    });
    expect(divergedSeen).toEqual([5, 6]);
    expect(passthrough).toEqual([5, 6]);
  });

  it(`onValue sees values`, async () => {
    const source = manual<number>();
    const seen: number[] = [];
    wrap(source).onValue(v => seen.push(v));
    source.set(1);
    source.set(2);
    await vi.waitFor(() => {
      expect(seen.length).toBe(2);
    });
    expect(seen).toEqual([1, 2]);
  });
});

describe(`rx/toGenerator`, () => {
  it(`iterates values from a source`, async () => {
    const source = manual<number>();
    const gen = toGenerator(source);

    const results: number[] = [];
    const consume = (async () => {
      for await (const v of gen) {
        results.push(v);
        if (results.length >= 3)
          break;
      }
    })();
    // Give the consumer a beat to start awaiting
    await new Promise(resolve => setTimeout(resolve, 20));

    source.set(1);
    source.set(2);
    source.set(3);
    await consume;
    expect(results).toEqual([1, 2, 3]);
  });

  it(`ends when the source completes`, async () => {
    const source = manual<number>();
    const gen = toGenerator(source);

    const results: number[] = [];
    const consume = (async () => {
      for await (const v of gen) {
        results.push(v);
      }
    })();
    await new Promise(resolve => setTimeout(resolve, 20));

    source.set(`a`);
    source.set(`b`);
    // Completion arrives via disposal
    source.dispose();
    await expect(consume).rejects.toThrow(/Source has completed/);
    expect(results).toEqual([`a`, `b`]);
  });
});

describe(`rx/prepare (graph)`, () => {
  it(`classifies fields as primitives or reactive nodes`, () => {
    const source = manual<number>();
    const p = prepare({ size: 10, name: `x`, source });
    expect(p.graph).toBeDefined();
    expect(typeof p.onValue).toBe(`function`);
    expect(p.isDisposed()).toBe(false);
    p.dispose();
    expect(p.isDisposed()).toBe(true);
  });
});

describe(`rx/ops/tap`, () => {
  it(`tapProcess runs side processors without changing the stream`, async () => {
    const source = manual<number>();
    const processed: number[] = [];
    const seen: number[] = [];

    const stream = tapProcess(source, (v) => {
      processed.push(v * 10);
    });
    stream.onValue(v => seen.push(v));

    source.set(1);
    source.set(2);
    await vi.waitFor(() => {
      expect(processed.length).toBe(2);
    });
    expect(processed).toEqual([10, 20]);
    expect(seen).toEqual([1, 2]);
  });

  it(`tapOps chains ops into the input stream`, async () => {
    const source = manual<number>();
    const doubled: number[] = [];
    const downstream = tapOps(
      source,
      Rx.Ops.transform((v: number) => v * 2),
    );
    downstream.onValue(v => doubled.push(v));

    source.set(3);
    await vi.waitFor(() => {
      expect(doubled.length).toBe(1);
    });
    expect(doubled).toEqual([6]);
  });
});

describe(`rx/reactives/debounce`, () => {
  it(`waits for quiet before emitting the last value`, async () => {
    vi.useFakeTimers();
    const source = manual<number>();
    const seen: number[] = [];
    debounce(source, { elapsed: 100 }).onValue(v => seen.push(v));

    source.set(1);
    source.set(2);
    source.set(3);
    await vi.advanceTimersByTimeAsync(50);
    expect(seen).toEqual([]);

    await vi.advanceTimersByTimeAsync(100);
    expect(seen).toEqual([3]);
    vi.useRealTimers();
  });
});
