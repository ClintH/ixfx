import test from 'ava';
import * as Rx from '../../../rx/index.js';
import * as Flow from '../../../flow/index.js';

test(`update`, async t => {
  const o = Rx.From.object({ name: `bob`, level: 2 });
  let count = 0;
  o.on(valueRaw => {
    const value = valueRaw.value;
    if (count === 0) t.deepEqual(value, { name: `Jane`, level: 2 });
    if (count === 1) t.deepEqual(value, { name: `Jane`, level: 3 });
    count++;
  });

  // Won't change anything, nor trigger the above event handler
  o.update({ name: `bob` });
  o.update({ level: 2 });
  t.deepEqual(o.last(), { name: `bob`, level: 2 });
  t.is(count, 0);

  o.update({ name: `Jane` });
  t.deepEqual(o.last(), { name: `Jane`, level: 2 });
  o.update({ level: 3 });
  t.deepEqual(o.last(), { name: `Jane`, level: 3 });

  const o2 = Rx.From.object([ `` ]);
  o2.on(message => {
    //console.log(`o2`, message.value);
    t.deepEqual(message.value, [ `a`, `b` ]);
    count++;
  });
  o2.onDiff(diffMsg => {
    t.deepEqual(diffMsg.value, [
      { path: '0', previous: '', value: 'a' },
      { path: '1', previous: undefined, value: 'b' }
    ]);
    count++;
  })
  o2.set([ `a`, `b` ]);

  await Flow.sleep(100);
  t.is(count, 4);
});


test(`field`, async t => {
  const o = Rx.From.object({ name: `bob`, level: 2 });
  let count = 0;
  o.on(valueRaw => {
    const value = valueRaw.value;
    if (count === 0) t.deepEqual(value, { name: `Jane`, level: 2 });
    if (count === 1) t.deepEqual(value, { name: `Jane`, level: 3 });
    count++;
  });

  // No changes
  o.updateField(`name`, `bob`);
  o.updateField(`level`, 2);
  t.is(count, 0);

  t.throws(() => { o.updateField(`blah`, `hello`) });
  o.updateField(`name`, `Jane`);
  o.updateField(`level`, 3);
  t.is(count, 2);
});

test(`set`, async t => {
  const o = Rx.From.object({ name: `bob`, level: 2 });
  let count = 0;
  let diffCount = 0;
  o.on(value => {
    const v = value.value;
    if (count === 0) t.deepEqual(v, { name: `jane`, level: 2 });
    if (count === 1) t.deepEqual(v, { name: `mary`, level: 3 });

    count++;
  });
  o.onDiff(diffV => {
    const diff = diffV.value;
    if (count === 0) t.deepEqual(diff, [
      { path: `name`, previous: `bob`, value: `jane` }
    ]);
    if (count === 1) t.deepEqual(diff, [
      { path: `name`, previous: `jane`, value: `mary` },
      { path: `level`, previous: 2, value: 3 }
    ]);

    //console.log(diff);
    diffCount++;
  })
  // Won't fire a change, since values are the same
  o.set({ name: `bob`, level: 2 });
  t.deepEqual(o.last(), { name: `bob`, level: 2 });

  o.set({ name: `jane`, level: 2 });
  t.deepEqual(o.last(), { name: `jane`, level: 2 });

  o.set({ name: `mary`, level: 3 });
  t.deepEqual(o.last(), { name: `mary`, level: 3 });

  t.is(count, 2);
  await Flow.sleep(1000);
});