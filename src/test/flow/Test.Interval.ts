import test from 'ava';
import { intervalToMs, interval, isInterval } from '../../flow/Interval.js';

test('interval', (t) => {
  t.true(isInterval(10));
  t.true(isInterval({ millis: 100 }));
  t.true(isInterval({ secs: 10 }));
  t.true(isInterval({ mins: 10 }));
  t.true(isInterval({ hours: 1 }));

  t.true(isInterval({ secs: 10, millis: 100 }));
  t.true(isInterval({ mins: 10, secs: 10, millis: 100 }));
  t.true(isInterval({ hours: 2, mins: 10, secs: 10, millis: 100 }));

  // @ts-ignore
  t.false(isInterval({ millis: false }));
  // @ts-ignore
  t.false(isInterval({ millis: 'hello' }));
  // @ts-ignore
  t.false(isInterval({ millis: undefined }));
  // @ts-ignore
  t.false(isInterval({ millis: null }));
  // @ts-ignore
  t.false(isInterval({ millis: Number.NaN }));

  t.false(isInterval(Number.NaN));

  // @ts-ignore
  t.false(isInterval(undefined));
  // @ts-ignore
  t.false(isInterval(null));
  // @ts-ignore
  t.false(isInterval('hello'));
  // @ts-ignore
  t.false(isInterval(false));
  // @ts-ignore
  t.false(isInterval(true));
  // @ts-ignore
  t.false(isInterval({ gorp: 10 }));
});

test('intervalToMs', (t) => {
  t.is(intervalToMs({ millis: 1000 }), 1000);

  t.is(intervalToMs({ secs: 1 }), 1000);

  t.is(intervalToMs({ millis: 1000, secs: 1 }), 2000);

  t.is(intervalToMs({ mins: 1 }), 60 * 1000);
  t.is(intervalToMs({ mins: 1, secs: 1 }), 60 * 1000 + 1000);

  t.is(intervalToMs({ hours: 1 }), 60 * 60 * 1000);
  t.is(
    intervalToMs({ hours: 1, mins: 1, secs: 1 }),
    60 * 60 * 1000 + 60 * 1000 + 1000
  );
});
