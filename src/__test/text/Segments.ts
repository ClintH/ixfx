import test from 'ava';
import { stringSegmentsLastToWhole, stringSegmentsFirstToWhole, stringSegmentsWholeToFirst, stringSegmentsWholeToEnd } from '../../text/Segments.js';

test(`stringSegmentsEndToStart`, t => {
  const result = [ ...stringSegmentsLastToWhole(`a.b.c.d`, `.`) ];
  t.deepEqual(result, [
    `d`,
    `c.d`,
    `b.c.d`,
    `a.b.c.d`
  ]);
});

test(`stringSegmentsStartToEnd`, t => {
  const result = [ ...stringSegmentsFirstToWhole(`a.b.c.d`, `.`) ];
  t.deepEqual(result, [
    `a`,
    `a.b`,
    `a.b.c`,
    `a.b.c.d`
  ]);
});

test(`stringSegmentsStartToStart`, t => {
  const result = [ ...stringSegmentsWholeToFirst(`a.b.c.d`, `.`) ];
  t.deepEqual(result, [
    `a.b.c.d`,
    `a.b.c`,
    `a.b`,
    `a`,
  ]);
});

test(`stringSegmentsEndToEnd`, t => {
  const result = [ ...stringSegmentsWholeToEnd(`a.b.c.d`, `.`) ];
  t.deepEqual(result, [
    `a.b.c.d`,
    `b.c.d`,
    `c.d`,
    `d`
  ]);
});
