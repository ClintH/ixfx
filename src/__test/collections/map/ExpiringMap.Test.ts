/* eslint-disable */
import test from 'ava';
import { expiringMap } from '../../../collections/map/index.js';
import * as Flow from '../../../flow/index.js';

test('get', async (t) => {
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
    t.is(m.get(`key-2`), `value-2`);
    if (checked) return;
    setTimeout(keepAlive, 100);

  }
  keepAlive();
  await Flow.sleep(1000);
  checked = true;
  t.false(m.has(`key-1`));
  t.true(m.has(`key-2`));
  t.false(m.has(`key-3`));
  t.is(fired, 2);
  m.dispose();
  checked = true;
});

test('set', async (t) => {
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
  await Flow.sleep(1000);
  checked = true;
  t.false(m.has(`key-1`));
  t.true(m.has(`key-2`));
  t.false(m.has(`key-3`));
  t.is(fired, 2);
  m.dispose();
  checked = true;
});