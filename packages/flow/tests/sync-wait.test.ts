import { assert, expect, describe, test, vi } from "vitest";
import { SyncWait } from "../src/sync-wait.js";

describe('SyncWait', () => {
  test('basic signal and wait', async () => {
    const sw = new SyncWait();
    let signalled = false;
    setTimeout(() => {
      signalled = true;
      sw.signal();
    }, 10);

    await sw.forSignal();
    expect(signalled).toBe(true);
  });

  test('signal before wait resolves immediately', async () => {
    const sw = new SyncWait();
    sw.signal();
    await sw.forSignal();
    // Should resolve without waiting
  });

  test('multiple signal/wait cycles', async () => {
    const sw = new SyncWait();
    
    // First cycle
    let signalled1 = false;
    setTimeout(() => {
      signalled1 = true;
      sw.signal();
    }, 10);
    await sw.forSignal();
    expect(signalled1).toBe(true);

    // Second cycle
    let signalled2 = false;
    setTimeout(() => {
      signalled2 = true;
      sw.signal();
    }, 10);
    await sw.forSignal();
    expect(signalled2).toBe(true);
  });

  test('forSignal throws on timeout', async () => {
    const sw = new SyncWait();
    await expect(sw.forSignal(50)).rejects.toContain('Timeout elapsed');
  });

  test('flush rejects pending waiters', async () => {
    const sw = new SyncWait();
    
    // Start waiting
    const waitPromise = sw.forSignal();
    
    // Flush while waiting
    setTimeout(() => {
      sw.flush();
    }, 10);

    // Should reject with 'Flushed'
    await expect(waitPromise).rejects.toBe('Flushed');
  });

  test('flush without pending waiters', () => {
    const sw = new SyncWait();
    // Should not throw
    sw.flush();
  });

  test('didSignal returns true when signalled', async () => {
    const sw = new SyncWait();
    
    setTimeout(() => {
      sw.signal();
    }, 10);

    const result = await sw.didSignal(100);
    expect(result).toBe(true);
  });

  test('didSignal returns false on timeout', async () => {
    const sw = new SyncWait();
    const result = await sw.didSignal(50);
    expect(result).toBe(false);
  });

  test('didSignal with signal before call', async () => {
    const sw = new SyncWait();
    sw.signal();
    const result = await sw.didSignal(100);
    expect(result).toBe(true);
  });

  test('multiple signals without wait', () => {
    const sw = new SyncWait();
    // Multiple signals should not cause issues
    sw.signal();
    sw.signal();
    sw.signal();
  });

  test('flush resets state', async () => {
    const sw = new SyncWait();
    sw.signal();
    sw.flush();
    
    // After flush, should need a new signal
    let signalled = false;
    setTimeout(() => {
      signalled = true;
      sw.signal();
    }, 10);

    await sw.forSignal();
    expect(signalled).toBe(true);
  });

  test('forSignal with zero timeout', async () => {
    const sw = new SyncWait();
    // Zero timeout means no timeout
    let signalled = false;
    setTimeout(() => {
      signalled = true;
      sw.signal();
    }, 10);

    await sw.forSignal(0);
    expect(signalled).toBe(true);
  });
});
