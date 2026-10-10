import { expect, it } from 'vitest';
import * as Flow from "../src/index.js";

it(`wait-for-value`, async () => {
  const q1 = new Flow.WaitForValue<string>();

  let readValue = ``;
  const reader = setTimeout(async () => {
    readValue = await q1.get();
  }, 50);

  setTimeout(() => {
    q1.add(`hello`);
  }, 200);

  // Well before the add timer: reader is waiting, value not yet available
  await Flow.sleep(120);
  expect(q1.isUsed).toBe(false);

  // Well after the add timer: reader has been resolved
  await Flow.sleep(100);
  expect(q1.isUsed).toBe(true);
  expect(readValue).toBe(`hello`);
  clearTimeout(reader);

  // Reusing the same instance: get() returns the already-resolved value
  // immediately, and a second add throws (first-write-wins)
  expect(await q1.get()).toBe(`hello`);
  expect(() => {
    q1.add(`there`);
  }).toThrow();
  expect(q1.isUsed).toBe(true);
});
