import test from 'ava';
import { keysToNumbers } from '../../data/KeysToNumbers.js';

test('keys-to-numbers', t => {
  const oGood = {
    '1': 'hello',
    '2': 'goodbye'
  }
  const r1 = keysToNumbers(oGood, `ignore`);
  t.deepEqual(r1, { 1: 'hello', 2: 'goodbye' });

  const r2 = keysToNumbers(oGood, `keep`);
  t.deepEqual(r2, { 1: 'hello', 2: 'goodbye' });

  const r3 = keysToNumbers(oGood, `throw`);
  t.deepEqual(r3, { 1: 'hello', 2: 'goodbye' });

  const oBad = {
    '1': 'hello',
    '2.4': 'goodbye',
    str: true
  }
  const r4 = keysToNumbers(oBad, `ignore`);
  t.deepEqual(r4, { 1: 'hello', 2: 'goodbye' });

  const r5 = keysToNumbers(oBad, `keep`);
  t.deepEqual(r5, { 1: 'hello', 2: 'goodbye', str: true });

  t.throws(() => keysToNumbers(oBad, `throw`));


});