import { expect, it } from 'vitest';
import { promiseFromEvent } from '../src/promise-from-event.js';

it(`resolves with the event`, async () => {
  const target = new EventTarget();
  const p = promiseFromEvent(target, `go`);

  // Resolves with the event object itself, not its payload
  target.dispatchEvent(new CustomEvent(`go`, { detail: 42 }));
  const event = await p;
  expect((event as CustomEvent).detail).toBe(42);
});

it(`resolves with the raw event for extra arguments`, async () => {
  const target = new EventTarget();
  const p = promiseFromEvent(target, `multi`);

  target.dispatchEvent(new CustomEvent(`multi`, { detail: [1, 2, 3] }));
  const event = await p;
  expect((event as CustomEvent).detail).toEqual([1, 2, 3]);
});

it(`removes listener after firing`, async () => {
  const target = new EventTarget();
  const p = promiseFromEvent(target, `once`);

  target.dispatchEvent(new CustomEvent(`once`, { detail: `first` }));
  const event = await p;
  expect((event as CustomEvent).detail).toBe(`first`);

  // Subsequent events do not re-resolve or throw: listener was removed.
  target.dispatchEvent(new CustomEvent(`once`, { detail: `second` }));
});
