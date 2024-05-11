import test from 'ava';
import * as Rx from '../../../rx/index.js';
import * as Flow from '../../../flow/index.js';

test(`sync-to-array`, async t => {
  const s1 = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9 ];
  const s2 = [ 10, 11, 12, 13, 14, 15, 16, 17, 18, 19 ];
  const createSources = () => ([
    Rx.From.array(s1, { interval: 5 }),
    Rx.From.array(s2, { interval: 20 })
  ])
  const r1 = Rx.syncToArray(createSources());
  const r1Array = await Rx.toArray(r1) as number[][];

  // Second source is slower, so we'd expect those numbers to increment by 1
  const max = 2;
  for (let i = 0; i < 2; i++) {
    t.is(r1Array[ i ][ 1 ], 10 + i);
  }

  // Total duration of source 1 is 10x5ms = 50ms
  // Total duration of source 2 is 10x20ms = 200ms
  t.is(r1Array.length, max);

  await Flow.sleep(500);

});