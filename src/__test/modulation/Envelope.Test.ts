import test from 'ava';
import * as Envelopes from '../../modulation/envelope/index.js';
import { repeat, interval, sleep, Elapsed } from '../../flow/index.js';
import { rangeCheck, someNearnessMany } from '../Include.js';
import { isApprox } from 'src/numbers/IsApprox.js';

test(`as-iterator`, async t => {
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
    if (elapsed() > 5000) t.fail(`Did not complete in time`);
  }
  // Check all stages seen
  t.true(seenA, `attack`);
  t.true(seenD, `decay`);
  t.true(seenR, `release`);
  const finalTime = elapsed();
  t.true(finalTime > 300 && finalTime < 320, `Final time: ${ finalTime }`);
});

test(`as-function`, async t => {
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
    if (elapsed() > 2000) t.fail(`Envelope took too long: ${ elapsed() }`);
    if (v === 0) break;
  }
  const total = elapsed();
  t.true(isApprox(0.1, 900, total), `Elapsed: ${ total }`);
});