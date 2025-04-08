import { test, expect } from 'vitest';
import { expiringMap } from '../../src/map/index.js';
import { sleep } from '@ixfxfun/core';

test('get', async () => {
  const m = expiringMap<string, string>({ autoDeletePolicy: `get`, autoDeleteElapsedMs: 200 });
  let fired = 0;
  m.addEventListener(`expired`, event => {
    fired++;
  });

  m.set(`key-1`, `value-1`);
  m.set(`key-2`, `value-2`);
  m.set(`key-3`, `value-3`);

  let checked = false;
  const keepAlive = () => {
    expect(m.get(`key-2`)).toBe(`value-2`);
    if (checked) return;
    setTimeout(keepAlive, 100);

  }
  keepAlive();
  await sleep(1000);
  checked = true;
  expect(m.has(`key-1`)).toBe(false);
  expect(m.has(`key-2`)).toBe(true);
  expect(m.has(`key-3`)).toBe(false);
  expect(fired).toBe(2);
  m.dispose();
  checked = true;
});

test('set', async () => {
  const m = expiringMap<string, string>({ autoDeletePolicy: `set`, autoDeleteElapsedMs: 200 });
  let fired = 0;
  m.addEventListener(`expired`, event => {
    fired++;
  });

  m.set(`key-1`, `value-1`);
  m.set(`key-2`, `value-2`);
  m.set(`key-3`, `value-3`);

  let checked = false;
  const keepAlive = () => {
    m.set(`key-2`, `value-2a`);
    if (checked) return;
    setTimeout(keepAlive, 100);

  }
  keepAlive();
  await sleep(1000);
  checked = true;
  expect(m.has(`key-1`)).toBe(false);
  expect(m.has(`key-2`)).toBe(true);
  expect(m.has(`key-3`)).toBe(false);
  expect(fired).toBe(2);
  m.dispose();
  checked = true;
});