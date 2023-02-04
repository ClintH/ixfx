import { interval, eachInterval} from '../../../dist/flow.js';
import * as Dom from '../../../dist/dom.js';
import { count } from '../../../dist/generators.js'

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

async function testBasicAbort() {
  log.log(`-- testBasicAbort --`);
  const ac = new AbortController();
  setTimeout(() => ac.abort(), 1000);
  try {
    await eachInterval(count(5), 1000, v => {
      log.log(v);
    }, ac.signal);
} catch (ex) {
  log.log(`Exception as expected`);
}
  log.log(`Done.`);
}
await testBasic();
await testBasicAbort();