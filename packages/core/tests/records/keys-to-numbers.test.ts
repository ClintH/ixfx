import { test, expect } from 'vitest';
import { keysToNumbers } from '../../src/records/keys-to-numbers.js';

test('keys-to-numbers', () => {
  const oGood = {
    '1': 'hello',
    '2': 'goodbye'
  }
  const r1 = keysToNumbers(oGood, `ignore`);
  expect(r1).toEqual({ 1: 'hello', 2: 'goodbye' });

  const r2 = keysToNumbers(oGood, `keep`);
  expect(r2).toEqual({ 1: 'hello', 2: 'goodbye' });

  const r3 = keysToNumbers(oGood, `throw`);
  expect(r3).toEqual({ 1: 'hello', 2: 'goodbye' });

  const oBad = {
    '1': 'hello',
    '2.4': 'goodbye',
    str: true
  }
  const r4 = keysToNumbers(oBad, `ignore`);
  expect(r4).toEqual({ 1: 'hello', 2: 'goodbye' });

  const r5 = keysToNumbers(oBad, `keep`);
  expect(r5).toEqual({ 1: 'hello', 2: 'goodbye', str: true });

  expect(() => keysToNumbers(oBad, `throw`)).toThrow();


});