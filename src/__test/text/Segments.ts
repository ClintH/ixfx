import expect from 'expect';
import { stringSegmentsLastToWhole, stringSegmentsFirstToWhole, stringSegmentsWholeToFirst, stringSegmentsWholeToEnd } from '../../text/Segments.js';

test(`stringSegmentsEndToStart`, () => {
  const result = [ ...stringSegmentsLastToWhole(`a.b.c.d`, `.`) ];
  expect(result).toEqual([
    `d`,
    `c.d`,
    `b.c.d`,
    `a.b.c.d`
  ]);
});

test(`stringSegmentsStartToEnd`, () => {
  const result = [ ...stringSegmentsFirstToWhole(`a.b.c.d`, `.`) ];
  expect(result).toEqual([
    `a`,
    `a.b`,
    `a.b.c`,
    `a.b.c.d`
  ]);
});

test(`stringSegmentsStartToStart`, () => {
  const result = [ ...stringSegmentsWholeToFirst(`a.b.c.d`, `.`) ];
  expect(result).toEqual([
    `a.b.c.d`,
    `a.b.c`,
    `a.b`,
    `a`,
  ]);
});

test(`stringSegmentsEndToEnd`, () => {
  const result = [ ...stringSegmentsWholeToEnd(`a.b.c.d`, `.`) ];
  expect(result).toEqual([
    `a.b.c.d`,
    `b.c.d`,
    `c.d`,
    `d`
  ]);
});
