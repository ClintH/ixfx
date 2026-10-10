import { expect, it, vi } from 'vitest';
import { expiringMap } from '../../src/map/index.js';

// Expiry sweep runs via setInterval at max(1000, autoDeleteElapsedMs * 2),
// so with autoDeleteElapsedMs: 200 the first sweep fires at t=1000.
// Fake timers make the schedule deterministic; keys are kept alive by
// touching them shortly before the sweep fires.

it(`get`, async () => {
  vi.useFakeTimers();
  const m = expiringMap<string, string>({ autoDeletePolicy: `get`, autoDeleteElapsedMs: 200 });
  let fired = 0;
  m.addEventListener(`expired`, () => {
    fired++;
  });

  m.set(`key-1`, `value-1`);
  m.set(`key-2`, `value-2`);
  m.set(`key-3`, `value-3`);

  // 'get' policy expires on last access. Touch key-2 at t=850 so its
  // elapsed (150ms) is below the 200ms window at the t=1000 sweep,
  // while key-1/key-3 (lastGet 0) expire.
  await vi.advanceTimersByTimeAsync(850);
  expect(m.get(`key-2`)).toBe(`value-2`);
  await vi.advanceTimersByTimeAsync(150);

  expect(m.has(`key-1`)).toBe(false);
  expect(m.has(`key-2`)).toBe(true);
  expect(m.has(`key-3`)).toBe(false);
  expect(fired).toBe(2);
  m.dispose();
  vi.useRealTimers();
});

it(`set`, async () => {
  vi.useFakeTimers();
  const m = expiringMap<string, string>({ autoDeletePolicy: `set`, autoDeleteElapsedMs: 200 });
  let fired = 0;
  m.addEventListener(`expired`, () => {
    fired++;
  });

  m.set(`key-1`, `value-1`);
  m.set(`key-2`, `value-2`);
  m.set(`key-3`, `value-3`);

  // 'set' policy expires on last set. Refresh key-2 at t=850.
  await vi.advanceTimersByTimeAsync(850);
  m.set(`key-2`, `value-2a`);
  await vi.advanceTimersByTimeAsync(150);

  expect(m.has(`key-1`)).toBe(false);
  expect(m.has(`key-2`)).toBe(true);
  expect(m.has(`key-3`)).toBe(false);
  expect(fired).toBe(2);
  m.dispose();
  vi.useRealTimers();
});
