import { expect, it } from 'vitest';
import { MapWithEvents } from '../../src/map/map-mutable-events.js';

type Recorder = Array<[ string, unknown ]>;

function recorder(): { events: Recorder; record: (name: string, arg: unknown) => void } {
  const events: Recorder = [];
  return { events, record: (name, arg) => events.push([name, arg]) };
}

it(`set fires key-added for new keys, key-updated for existing`, () => {
  const m = new MapWithEvents<string, string>();
  const r = recorder();
  m.addEventListener(`key-added`, e => r.record(`key-added`, e));
  m.addEventListener(`key-updated`, e => r.record(`key-updated`, e));
  m.addEventListener(`added`, e => r.record(`added`, e));

  m.set(`a`, `1`);
  m.set(`a`, `2`);
  m.set(`b`, `3`);

  expect(r.events).toEqual([
    [`key-added`, { key: `a`, value: `1` }],
    [`added`, { key: `a`, value: `1` }],
    [`key-updated`, { key: `a`, value: `2` }],
    [`added`, { key: `a`, value: `2` }],
    [`key-added`, { key: `b`, value: `3` }],
    [`added`, { key: `b`, value: `3` }],
  ]);
});

it(`add accepts key/value objects and tuples`, () => {
  const m = new MapWithEvents<string, string>();
  m.add({ key: `a`, value: `1` }, [`b`, `2`]);
  expect(m.get(`a`)).toBe(`1`);
  expect(m.get(`b`)).toBe(`2`);
});

it(`delete fires removed with the deleted value`, () => {
  const m = new MapWithEvents<string, string>();
  const r = recorder();
  m.addEventListener(`removed`, e => r.record(`removed`, e));

  m.set(`a`, `1`);
  m.delete(`a`);
  // Deleting a missing key is a no-op
  m.delete(`missing`);

  expect(r.events).toEqual([[`removed`, { key: `a`, value: `1` }]]);
  expect(m.get(`a`)).toBeUndefined();
});

it(`clear fires cleared and empties the map`, () => {
  const m = new MapWithEvents<string, string>();
  const r = recorder();
  m.addEventListener(`cleared`, () => r.record(`cleared`, undefined));

  m.set(`a`, `1`);
  m.clear();

  expect(r.events).toEqual([[`cleared`, undefined]]);
  expect(m.isEmpty()).toBe(true);
});

it(`basic map operations`, () => {
  const m = new MapWithEvents<string, string>();
  m.set(`a`, `1`);
  m.set(`b`, `2`);

  expect(m.has(`a`)).toBe(true);
  expect(m.has(`zzz`)).toBe(false);
  // NB: no keys() iterator on this class; use entries()
  expect([...m.entries()]).toEqual([[`a`, `1`], [`b`, `2`]]);
  expect([...m.values()]).toEqual([`1`, `2`]);
  expect(m.isEmpty()).toBe(false);

  m.delete(`a`);
  expect(m.isEmpty()).toBe(false);
  m.delete(`b`);
  expect(m.isEmpty()).toBe(true);
});
