/* eslint-disable unicorn/prevent-abbreviations */
import { test, expect, assert } from 'vitest';
import { isApprox } from '@ixfx/numbers';
import { sleep, elapsedSince } from '@ixfx/core';
import * as Envelopes from '../src/envelope/index.js';

test(`as-iterator`, async done => {
  const e = new Envelopes.Adsr({
    attackDuration: 100,
    decayDuration: 100,
    releaseDuration: 100
  });
  const elapsed = elapsedSince();
  let seenA = false;
  let seenD = false;
  let seenR = false;
  // eslint-disable-next-line @typescript-eslint/await-thenable
  for await (const _v of e) {
    const cc = e.compute();
    if (cc[ 0 ] === `attack`) seenA = true;
    if (cc[ 0 ] === `decay`) seenD = true;
    if (cc[ 0 ] === `release`) seenR = true;
    await sleep(50);
    //if (elapsed() > 5000) done.fail(`Did not complete in time`);
    assert(elapsed() < 5000, `Did not complete in time`)
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
  //t.timeout(5000);
  const elapsed = elapsedSince();
  while (true) {
    const v = await e();
    await sleep(100);
    //if (elapsed() > 2000) done.fail(`Envelope took too long: ${ elapsed() }`);
    assert(elapsed() < 2000, `Did not complete in time: ${ elapsed() }`)

    if (v === 0) break;
  }
  const total = elapsed();
  expect(isApprox(0.2, 900, total)).toBe(true);
});