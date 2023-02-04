import {sleep} from '../../../dist/flow.js';
import * as Dom from '../../../dist/dom.js';

const log = Dom.log(`#log`, {
  capacity: 20,
  collapseDuplicates: false,
  timestamp: true
});

async function testBasic() {
  log.log(`-- testBasic --`);
  log.log(`Sleeping`);
  await sleep(5*1000);
  log.log(`Awake`);
}

async function testWithValue() {
  log.log(`-- testWithValue --`);
  log.log(`Sleeping`);
  const v = await sleep(5*1000, `hello`);
  log.log(`Awake with value: ${v}`);
}

async function testCancel() {
  log.log(`-- testCancel --`);
  log.log(`Sleeping`);
  const ac = new AbortController();
  
  setTimeout(() => {
    log.log(`Aborting sleep`);
    ac.abort();
  }, 5000);
  await sleep(5*60*1000, undefined, ac.signal);
  log.log(`Awake`);

}
await testCancel();
