import test from 'ava';
import * as Rx from '../../../rx/index.js';
import * as Flow from '../../../flow/index.js';

test(`event`, async t => {
  const target = new EventTarget();

  const v1 = Rx.From.event(target, `hello`);
  t.falsy(v1.last());
  const results: string[] = [];
  let gotDone = false
  v1.on(msg => {
    if (Rx.messageHasValue(msg)) {
      results.push((msg as any).value.detail);
    } else if (Rx.messageIsDoneSignal(msg)) {
      gotDone = true;
    } else {
      t.fail(`Unexpected message: ${ JSON.stringify(msg) }`);
    }
  });
  target.dispatchEvent(new CustomEvent(`wrong`, { detail: `wrong-1` }));

  const produceEvents = (count: number) => {
    const expected = [];
    for (let i = 0; i < 5; i++) {
      const value = `hello-${ i }`;
      expected.push(value);
      target.dispatchEvent(new CustomEvent(`hello`, { detail: value }));
    }
    return expected;
  }

  const expectedFive = produceEvents(5);
  await Flow.sleep(200);
  t.deepEqual(results, expectedFive);
  t.false(gotDone, `Received done message too early`);

  // Unsubscribe - expect that we don't receive any additional data
  v1.dispose(`test dispose`);
  const expectedTen = produceEvents(10);
  await Flow.sleep(200);
  t.true(gotDone, `Did not receive done message`);
  t.true(v1.isDisposed());
  t.deepEqual(results, expectedFive);

});