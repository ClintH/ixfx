import expect from 'expect';
import * as Flow from "../../flow/index.js";
import { isApprox } from "../../numbers/IsApprox.js";

test(`wait-for-value`, async () => {
  const q1 = new Flow.WaitForValue<string>();

  let since = Flow.Elapsed.since();
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
  since = Flow.Elapsed.since();
  readTime = 0;
  readValue = ``;
  setTimeout(async () => {
    readValue = await q1.get();
    readTime = since();
  }, 10);

  expect(() => q1.add(`there`)).toThrow();

  await Flow.sleep(15);
  expect(readValue).toBe(`hello`); // Expect initial value still
  expect(isApprox(0.25, 10, readTime)).toBe(true);

});
