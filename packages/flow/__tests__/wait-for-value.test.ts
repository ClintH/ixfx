import { test, expect } from 'vitest';
import * as Flow from "../src/index.js";
import * as Elapsed from "@ixfx/core/elapsed";
import { isApprox } from '@ixfx/numbers';

test(`wait-for-value`, async () => {
  const q1 = new Flow.WaitForValue<string>();

  let since = Elapsed.elapsedSince();
  let readValue = ``;
  let readTime = 0;
  setTimeout(async () => {
    readValue = await q1.get();
    readTime = since();
  }, 50);

  setTimeout(() => {
    q1.add(`hello`);
  }, 200)

  await Flow.sleep(210);
  expect(isApprox(0.1, 200, readTime)).toBe(true);
  expect(readValue).toBe(`hello`);

  // Reusing
  since = Elapsed.elapsedSince();
  readTime = 0;
  readValue = ``;
  setTimeout(async () => {
    readValue = await q1.get();
    readTime = since();
  }, 10);

  expect(() => { q1.add(`there`); }).toThrow();

  await Flow.sleep(15);
  expect(readValue).toBe(`hello`); // Expect initial value still
  expect(isApprox(0.25, 10, readTime)).toBe(true);

});
