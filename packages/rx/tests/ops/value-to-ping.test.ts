import { describe, test, expect } from 'vitest';
import { valueToPing } from '../../src/ops/value-to-ping.js';
import { manual } from '../../src/index.js';
import { sleep } from '@ixfx/core';

describe('rx/ops/value-to-ping', () => {
  test('pings target when source emits', async () => {
    const source = manual<number>();
    const target = manual<string>();
    
    // Make target pingable
    const pingableTarget = {
      ...target,
      ping: () => target.set('pinged')
    };

    const result = valueToPing(source, pingableTarget, {});

    const values: string[] = [];
    result.onValue((v) => values.push(v));

    // Target emits initial value
    target.set('initial');
    await sleep(10);
    
    // Source emission should ping target
    source.set(1);
    await sleep(10);
    
    expect(values).toContain('pinged');
  });

  test('uses gate function to filter pings', async () => {
    const source = manual<number>();
    const target = manual<string>();
    
    const pingableTarget = {
      ...target,
      ping: () => target.set('pinged')
    };

    // Only ping if value > 5
    const result = valueToPing(source, pingableTarget, {
      gate: (v) => v > 5
    });

    const values: string[] = [];
    result.onValue((v) => values.push(v));

    target.set('initial');
    await sleep(10);

    // This should not ping (value = 3)
    source.set(3);
    await sleep(10);
    
    const countBefore = values.filter(v => v === 'pinged').length;

    // This should ping (value = 10)
    source.set(10);
    await sleep(10);
    
    expect(values.filter(v => v === 'pinged').length).toBeGreaterThan(countBefore);
  });

  test('closes when source completes', async () => {
    const source = manual<number>();
    const target = manual<string>();
    
    const pingableTarget = {
      ...target,
      ping: () => {}
    };

    const result = valueToPing(source, pingableTarget, {});

    result.on(() => {});
    source.set(1);
    
    expect(result.isDisposed()).toBe(false);
    
    source.dispose('done');
    await sleep(10);
    
    expect(result.isDisposed()).toBe(true);
  });

  test('closes when target completes', async () => {
    const source = manual<number>();
    const target = manual<string>();
    
    const pingableTarget = {
      ...target,
      ping: () => {}
    };

    const result = valueToPing(source, pingableTarget, {});

    result.on(() => {});
    source.set(1);
    
    expect(result.isDisposed()).toBe(false);
    
    target.dispose('done');
    await sleep(10);
    
    expect(result.isDisposed()).toBe(true);
  });

  test('respects abort signal', async () => {
    const source = manual<number>();
    const target = manual<string>();
    const abortController = new AbortController();
    
    const pingableTarget = {
      ...target,
      ping: () => target.set('pinged')
    };

    const result = valueToPing(source, pingableTarget, {
      signal: abortController.signal
    });

    result.on(() => {});
    source.set(1);
    
    expect(result.isDisposed()).toBe(false);
    
    abortController.abort();
    await sleep(10);
    
    expect(result.isDisposed()).toBe(true);
  });

  test('emits values from target', async () => {
    const source = manual<number>();
    const target = manual<string>();
    
    const pingableTarget = {
      ...target,
      ping: () => {}
    };

    const result = valueToPing(source, pingableTarget, {});

    const values: string[] = [];
    result.onValue((v) => values.push(v));

    // Target emits values
    target.set('a');
    target.set('b');
    target.set('c');
    
    await sleep(10);
    
    expect(values).toContain('a');
    expect(values).toContain('b');
    expect(values).toContain('c');
  });
});
