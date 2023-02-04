import {continuously, interval, eachInterval} from '../../../dist/flow.js';
import * as Dom from '../../../dist/dom.js';
import { count } from '../../../dist/generators.js'

const log = Dom.log(`#log`, {
  capacity: 20,
  collapseDuplicates: false,
  timestamp: true
});

function testInterval() {
  const c = continuously(() => {
    log.log(`every 30 secs`);
  }, 30*1000).start();
}

function testTicksInCallback() {
  const c = continuously((ticks, elapsedMs) => {
    log.log(`stops after 10 ticks`);
    return ticks <= 10; // Return false once we hit 10
  }, 1*1000).start();
}

/**
 * Loop runs every 2s, and we pepper it with .start() calls.
 * After 2s it cancels 
 */
async function testRestartCancel() {
  let t = 0;
  let left = 5;
  log.log(`-- testRestartCancel --`);
  const c = continuously(() => {
    log.log(`run`);
  }, 1*1000, {
    onStartCalled:(ticks, elapsedMs) => {
      log.log(`OnStartCalled. ticks: ${ticks} elapsedMs: ${elapsedMs}`);
      if (elapsedMs >= 2000) return `cancel`;
    }
  });

  eachInterval(count(10), 1000, () => {
    log.log(`.start()`);
    c.start();
  });

  c.start();
  log.log(`Done.`);
}
testRestartCancel();
