import test from "ava";
import * as Flow from "../../flow/index.js";
import { isApprox } from "../../numbers/IsApprox.js";

test(`wait-for-value`, async t => {
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
  t.true(isApprox(0.1, 200, readTime), `Read time: ${ readTime }`);
  t.is(readValue, `hello`);

  // Reusing
  since = Flow.Elapsed.since();
  readTime = 0;
  readValue = ``;
  setTimeout(async () => {
    readValue = await q1.get();
    readTime = since();
  }, 10);

  t.throws(() => q1.add(`there`));

  await Flow.sleep(15);
  t.is(readValue, `hello`); // Expect initial value still
  t.true(isApprox(0.25, 10, readTime), `Read time: ${ readTime }`);

});
