import { assert, expect, test } from "vitest";
import { SyncWait } from "../src/sync-wait.js";

test(`syncWait`, async done => {
  const sw = new SyncWait();
  let signalled = false;
  setTimeout(() => {
    signalled = true;
    sw.signal();
  }, 100);

  await sw.forSignal();
  expect(signalled).toBe(true);

  signalled = false;
  setTimeout(() => {
    signalled = true;
    sw.signal();
  }, 100);

  await sw.forSignal();
  expect(signalled).toBe(true);

  // Test signal before wait
  const sw2 = new SyncWait();
  sw2.signal();
  await sw2.forSignal();

  // Test elapsed
  const sw3 = new SyncWait();
  try {
    await sw3.forSignal(100);
    assert.fail(`Exception not thrown`)
  } catch (error) {}
});