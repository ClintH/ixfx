import test from 'ava';
import {intervalToMs} from '../../flow/Interval.js';

test('intervalToMs', t => {
  t.is(intervalToMs({millis:1000}), 1000);

  t.is(intervalToMs({secs:1}), 1000);

  t.is(intervalToMs({millis:1000, secs:1}), 2000);

  t.is(intervalToMs({mins:1}), 60*1000);
  t.is(intervalToMs({mins:1, secs:1}), (60*1000)+1000);

  t.is(intervalToMs({hrs:1}), 60*60*1000);
  t.is(intervalToMs({hrs: 1, mins:1, secs:1}), (60*60*1000)+(60*1000)+1000);
});