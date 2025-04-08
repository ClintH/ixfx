import expect from 'expect';
import * as Envelopes from '../../modulation/envelope/index.js';
import { sleep, Elapsed } from '../../flow/index.js';
import { isApprox } from '../../numbers/IsApprox.js';

test(`as-iterator`, async done => {
  const e = new Envelopes.Adsr({
    attackDuration: 100,
    decayDuration: 100,
    releaseDuration: 100
  });
  const elapsed = Elapsed.since();
  let seenA = false;
  let seenD = false;
  let seenR = false;
  for await (const v of e) {
    const cc = e.compute();
    if (cc[ 0 ] === `attack`) seenA = true;
    if (cc[ 0 ] === `decay`) seenD = true;
    if (cc[ 0 ] === `release`) seenR = true;
    await sleep(50);
    if (elapsed() > 5000) done.fail(`Did not complete in time`);
  }
  // Check all stages seen
  expect(seenA).toBe(true);
  expect(seenD).toBe(true);
  expect(seenR).toBe(true);
  const finalTime = elapsed();
  expect(finalTime > 300 && finalTime < 320).toBe(true);
});

test(`as-function`, async done => {
  // TODO: Not really testing much
  const e = Envelopes.adsr({
    attackDuration: 300,
    decayDuration: 300,
    releaseDuration: 300,
    releaseLevel: 0,
    initialLevel: 0.1,
    sustainLevel: 1
  });
  t.timeout(5000);
  const elapsed = Elapsed.since();
  while (true) {
    const v = await e();
    await sleep(100);
    if (elapsed() > 2000) done.fail(`Envelope took too long: ${ elapsed() }`);
    if (v === 0) break;
  }
  const total = elapsed();
  expect(isApprox(0.2, 900, total)).toBe(true);
});