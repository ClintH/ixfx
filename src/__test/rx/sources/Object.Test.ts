import expect from 'expect';
import * as Rx from '../../../rx/index.js';
import * as Flow from '../../../flow/index.js';

test(`diff-field`, async () => {
  const o = Rx.From.object({
    name: `bob`,
    colour: {
      h: 0.1,
      s: 0.2,
      l: 0.3
    },
    level: 2
  });
  let onName = 0;
  let onColourS = 0;
  let onColour = 0;
  o.onField(`name`, value => {
    onName++;
    if (onName === 1) expect(value.value).toBe(`sally`);
    if (onName === 2) expect(value.value).toBe(`mary`);
    expect(onName <= 2).toBe(true);
  });
  o.onField(`colour.s`, value => {
    onColourS++;
    if (onColourS === 1) expect(value.value).toBe(0.5);
    if (onColourS === 2) expect(value.value).toBe(0.9);
    expect(onColourS <= 2).toBe(true);
  });

  o.onField(`colour.*`, (value) => {
    onColour++;
    //if (onColour === 1) t.is(value.value, { h: 0.1, s: 0.5, l: 0.3 });
    if (onColour === 1) {
      expect(value.value).toBe(0.5);
      expect(value.fieldName).toBe(`colour.s`);
    }
    //if (onColour === 2) t.is(value.value, { h: 0.1, s: 0.9, l: 0.3 });
    if (onColour === 2) {
      expect(value.value).toBe(0.9);
      expect(value.fieldName).toBe(`colour.s`);
    }
    expect(onColour <= 2).toBe(true);

  });
  // Try setting objects
  o.update({ name: 'sally' });
  o.update({
    colour: {
      s: 0.5
    }
  });
  await Flow.sleep(100);

  // Try updating fields
  o.updateField(`name`, `mary`);
  o.updateField(`colour.s`, 0.9);
  await Flow.sleep(50);
});

test(`update`, async () => {
  const o = Rx.From.object({ name: `bob`, level: 2 });
  let count = 0;
  o.onValue(value => {
    if (count === 0) expect(value).toEqual({ name: `Jane`, level: 2 });
    if (count === 1) expect(value).toEqual({ name: `Jane`, level: 3 });
    count++;
  });

  // Won't change anything, nor trigger the above event handler
  // since data is the same
  o.update({ name: `bob` });
  o.update({ level: 2 });
  expect(o.last()).toEqual({ name: `bob`, level: 2 });
  await Flow.sleep(50);
  expect(count).toBe(0);

  // Now will trigger a change
  o.update({ name: `Jane` });
  expect(o.last()).toEqual({ name: `Jane`, level: 2 });
  o.update({ level: 3 });
  expect(o.last()).toEqual({ name: `Jane`, level: 3 });

  const o2 = Rx.From.object([ `` ]);
  o2.on(message => {
    //console.log(`o2`, message.value);
    expect(message.value).toEqual([ `a`, `b` ]);
    count++;
  });
  o2.onDiff(value => {
    expect(value).toEqual([
      { path: '0', previous: '', value: 'a', state: `change` },
      { path: '1', previous: undefined, value: 'b', state: `added` }
    ]);
    count++;
  })
  o2.set([ `a`, `b` ]);

  await Flow.sleep(100);
  expect(count).toBe(4);
});


test(`field`, async () => {
  const o = Rx.From.object({ name: `bob`, level: 2 });
  let count = 0;
  o.on(valueRaw => {
    const value = valueRaw.value;
    if (count === 0) expect(value).toEqual({ name: `Jane`, level: 2 });
    if (count === 1) expect(value).toEqual({ name: `Jane`, level: 3 });
    count++;
  });

  // No changes
  o.updateField(`name`, `bob`);
  o.updateField(`level`, 2);
  expect(count).toBe(0);

  expect(() => { o.updateField(`blah`, `hello`) }).toThrow();
  o.updateField(`name`, `Jane`);
  o.updateField(`level`, 3);
  expect(count).toBe(2);
});

test(`set`, async () => {
  const o = Rx.From.object({ name: `bob`, level: 2 });
  let count = 0;
  let diffCount = 0;
  o.on(value => {
    const v = value.value;
    if (count === 0) expect(v).toEqual({ name: `jane`, level: 2 });
    if (count === 1) expect(v).toEqual({ name: `mary`, level: 3 });
    count++;
  });
  o.onDiff(diff => {
    //console.log(`count:${ count }`, diff);
    if (count === 1) expect(diff).toEqual([
      { path: `name`, previous: `bob`, value: `jane`, state: `change` }
    ]);
    else if (count === 2) expect(diff).toEqual([
      { path: `name`, previous: `jane`, value: `mary`, state: `change` },
      { path: `level`, previous: 2, value: 3, state: `change` }
    ]);

    //console.log(diff);
    diffCount++;
  })
  // Won't fire a change, since values are the same
  o.set({ name: `bob`, level: 2 });
  expect(o.last()).toEqual({ name: `bob`, level: 2 });

  o.set({ name: `jane`, level: 2 });
  expect(o.last()).toEqual({ name: `jane`, level: 2 });

  o.set({ name: `mary`, level: 3 });
  expect(o.last()).toEqual({ name: `mary`, level: 3 });

  expect(count).toBe(2);
  await Flow.sleep(1000);
});