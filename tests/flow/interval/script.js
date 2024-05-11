import { interval} from '../../../dist/flow.js';
import * as Dom from '../../../dist/dom.js';
import { count } from '../../../dist/numbers.js'

const log = Dom.log(`#log`, {
  capacity: 20,
  collapseDuplicates: false,
  timestamp: true
});

async function testBasic() {
  log.log(`-- testBasic --`);
  
  await eachInterval(count(5), 1000, v => {
    log.log(v);
  });

  log.log(`Done.`);
}
//await testBasic();


async function testBasicAbort() {
  log.log(`-- testBasicAbort --`);
  const ac = new AbortController();
  setTimeout(() => {
    log.log(`Aborting`);
    ac.abort()
  }, 1000);
  
  try {
    for await (const v of interval(count(5), 500, ac.signal)) {
      log.log(v);
    }
  } catch (ex) {
    log.log(`Exception as expected`);
  }
  log.log(`Done.`);
}
await testBasicAbort();

async function testInterval() {
  log.log(`-- testBasicAbort --`);
  for await (const v of interval(count(5), 1000)) {
    log.log(v);
  }
  log.log(`Done.`);
}
//await testInterval();