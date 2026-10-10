import {continuously, interval} from '../../../dist/flow.js';
import * as Dom from '../../../dist/dom.js';
import { count } from '../../../dist/numbers.js'

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
 * Loop runs every 500ms, and we pepper it with .start() calls.
 * After 1s it disposes, to prevent restarting.
 * 
 * Behaviour should be a few `run` messages and everything stopping after 1s
 */
async function testRestartDispose() {
  let t = 0;
  let left = 5;
  log.log(`-- testRestartDispose --`);
  const c = continuously(() => {
    log.log(`run`);
  }, 500, {
    onStartCalled:(ticks, elapsedMs) => {
      log.log(`OnStartCalled. ticks: ${ticks} elapsedMs: ${elapsedMs}`);
      if (elapsedMs >= 1000) return `dispose`;
    }
  });

  eachInterval(count(10), 1000, () => {
    log.log(`.start()`);
    c.start();
  });

  c.start();
  log.log(`Done.`);
}

const ms = (ms) => {
  if (ms < 1000) return Math.floor(ms) +'ms';
  return (ms/1000).toFixed(1) + 's';
}

/**
 * Loop runs every 500ms. After 1000 it will be cancelled, and after 5s restarted.
 * 
 * Behaviour:
 *  - `run` appears once or so, stops for a while and then continues running
 */
async function testCancelStart() {
  let t = 0;
  let left = 5;
  log.log(`-- testCancelStart --`);
  const c = continuously((ticks, intervalMs) => {
    log.log(`run. ticks: ${ticks} interval: ${ms(intervalMs)}`);
  }, 500);

  // Cancel
  setTimeout(() => {
    c.cancel();
  }, 1000);

  // Restart
  setTimeout(() => {
    log.log(`Attempting restart`);
    // reset/start has the same outcome
    //c.reset();
    c.start();
  }, 5000);

  c.start();
  log.log(`Done.`);
}

/**
 * Long interval loop, but because `fireBeforeWait` is true, run message
 * appears early.
 */
async function testFireBeforeWait() {
  let t = 0;
  let left = 5;
  log.log(`-- testFireBeforeWait --`);
  const c = continuously((ticks, intervalMs) => {
    log.log(`run. ticks: ${ticks} interval: ${ms(intervalMs)}`);
  }, 10*1000, { fireBeforeWait: true });

  c.start();
}


/**
 * Behaviour:
 * - No `run` messages unil the change of tempo kicks in,
 * - Since we are resetting, change will activate immediately
 */
async function testLongReset() {
  log.log(`-- testLongReset --`);
  const c = continuously((ticks, intervalMs) => {
    log.log(`run. ticks: ${ticks} interval: ${ms(intervalMs)}`);
  }, 60*1000);

  // Change tempo and reset
  setTimeout(() => {
    log.log(`Changing tempo and resetting`);
    c.intervalMs = 100;
    c.reset();
  }, 5000);

  c.start();
  log.log(`Done.`);
}
//testLongReset();


// async function testSimple() {
//   continuously(() => {
//     log.log(`Loop`);
//   }).start();
// };
// testSimple();