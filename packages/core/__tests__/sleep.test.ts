import { test, expect } from "vitest";
import { sleep } from "../src/sleep.js";

test(`sleep`, async () => {
  const ac = new AbortController();

  setTimeout(() => {
    ac.abort(`test abort`);
  }, 200);
  // await t.throwsAsync(async () => {
  //   await sleep({ secs: 60, signal: ac.signal });
  // });
  await expect(async () => {
    await sleep({ secs: 60, signal: ac.signal });
  }).rejects.toThrowError();
});
