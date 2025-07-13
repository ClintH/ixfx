import expect from 'expect';
import * as Rx from '../../../rx/index.js';
import * as Flow from '../../../flow/index.js';

test(`event`, async done => {
  const target = new EventTarget();

  const v1 = Rx.From.event(target, `hello`, { detail: `test` });
  expect(v1.last()).toEqual({ detail: `test` });
  const results: string[] = [];
  let gotDone = false
  v1.on(msg => {
    if (Rx.messageHasValue(msg)) {
      results.push((msg as any).value.detail);
    } else if (Rx.messageIsDoneSignal(msg)) {
      gotDone = true;
    } else {
      done.fail(`Unexpected message: ${ JSON.stringify(msg) }`);
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
  expect(results).toEqual(expectedFive);
  expect(gotDone).toBe(false);

  // Unsubscribe - expect that we don't receive any additional data
  v1.dispose(`test dispose`);
  const expectedTen = produceEvents(10);
  await Flow.sleep(200);
  expect(gotDone).toBe(true);
  expect(v1.isDisposed()).toBe(true);
  expect(results).toEqual(expectedFive);

});