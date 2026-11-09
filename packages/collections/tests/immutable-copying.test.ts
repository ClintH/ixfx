import { describe, expect, it } from 'vitest';
import * as Dg from '../src/graph/directed-graph.js';
import * as Ug from '../src/graph/undirected-graph.js';
import { ofSimple } from '../src/map/map-of-simple.js';
import { immutable as map } from '../src/map/map.js';
import { enqueue } from '../src/queue/queue-fns.js';
import { immutable as queue, QueueImmutable } from '../src/queue/queue-immutable.js';
import { immutable as set, SetStringImmutable } from '../src/set/SetImmutable.js';
import { immutable as stack, StackImmutable } from '../src/stack/StackImmutable.js';

describe(`queue overflow with several items`, () => {
  it(`additions: fills remaining slots from the front of toAdd`, () => {
    expect(enqueue({ capacity: 5, discardPolicy: `additions` }, [`a`, `b`, `c`], `d`, `e`, `f`, `g`))
      .toEqual([`a`, `b`, `c`, `d`, `e`]);
  });
  it(`newer: same as enqueuing one at a time`, () => {
    const opts = { capacity: 5, discardPolicy: `newer` } as const;
    const batch = enqueue(opts, [`a`, `b`, `c`], `d`, `e`, `f`, `g`);
    let sequence: readonly string[] = [`a`, `b`, `c`];
    for (const v of [`d`, `e`, `f`, `g`]) sequence = enqueue(opts, sequence, v);
    expect(batch).toEqual([`a`, `b`, `c`, `d`, `g`]);
    expect(sequence).toEqual(batch);
    expect(enqueue(opts, [], 1, 2, 3, 4, 5, 6, 7)).toEqual([1, 2, 3, 4, 7]);
  });
  it(`newer: many more items than capacity`, () => {
    const toAdd = Array.from({ length: 10 }, (_, i) => i);
    expect(enqueue({ capacity: 3, discardPolicy: `newer` }, [-1], ...toAdd)).toEqual([-1, 0, 9]);
  });
  it(`older`, () => {
    expect(enqueue({ capacity: 4, discardPolicy: `older` }, [`a`, `b`], `c`, `d`, `e`))
      .toEqual([`b`, `c`, `d`, `e`]);
    expect(enqueue({ capacity: 2, discardPolicy: `older` }, [`a`, `b`], `c`, `d`, `e`))
      .toEqual([`d`, `e`]);
  });
});

describe(`inputs are not aliased`, () => {
  it(`map`, () => {
    const source = new Map([[`a`, 1]]);
    const m = map(source);
    source.set(`b`, 2);
    expect(m.has(`b`)).toBe(false);
  });
  it(`queue constructor`, () => {
    const source = [1, 2];
    const q = new QueueImmutable({}, source);
    source.push(3);
    expect(q.toArray()).toEqual([1, 2]);
  });
  it(`stack constructor`, () => {
    const source = [1, 2];
    const s = new StackImmutable({}, source);
    source.push(3);
    expect(s.data).toEqual([1, 2]);
  });
  it(`set constructor`, () => {
    const source = new Map([[`a`, `a`]]);
    const s = new SetStringImmutable<string>(v => v, source);
    source.set(`b`, `b`);
    expect(s.has(`b`)).toBe(false);
  });
});

describe(`no-op changes return the same instance`, () => {
  it(`map`, () => {
    const m = map<string, number>([[`a`, 1]]);
    expect(m.delete(`missing`)).toBe(m);
    expect(m.set(`a`, 1)).toBe(m);
    expect(m.add()).toBe(m);
    expect(m.set(`a`, 2)).not.toBe(m);
    expect(m.get(`a`)).toBe(1);
  });
  it(`set`, () => {
    const s = set<string>(v => v).add(`a`);
    expect(s.delete(`missing`)).toBe(s);
    expect(s.add(`a`)).toBe(s);
    expect(s.add(`b`).has(`b`)).toBe(true);
    expect(s.has(`b`)).toBe(false);
  });
  it(`queue`, () => {
    const q = queue({ capacity: 2 }, 1, 2);
    expect(q.enqueue()).toBe(q);
    expect(q.enqueue(3)).toBe(q); // Full, additions discarded
  });
  it(`stack`, () => {
    const s = stack({}, 1, 2);
    expect(s.push()).toBe(s);
    const top: number[] = [];
    s.forEachFromTop(v => top.push(v));
    expect(top).toEqual([2, 1]);
  });
  it(`directed graph connect of existing edge`, () => {
    const g = Dg.graph({ from: `a`, to: `b` });
    expect(Dg.connect(g, { from: `a`, to: `b` })).toBe(g);
    expect(Dg.removeVertex(g, `missing`)).toBe(g);
  });
  it(`undirected graph connect of existing edge`, () => {
    const g = Ug.graph({ a: `a`, b: `b` });
    expect(Ug.connect(g, { a: `b`, b: `a` })).toBe(g);
  });
});

describe(`withMutations`, () => {
  it(`returns original graph if nothing changed`, () => {
    const g = Dg.graph({ from: `a`, to: `b` });
    expect(Dg.withMutations(g, d => d)).toBe(g);
  });
  it(`nested calls share the outer draft`, () => {
    const g = Dg.graph();
    const g2 = Dg.withMutations(g, (draft) => {
      const inner = Dg.withMutations(draft, d => Dg.connect(d, { from: `a`, to: `b` }));
      expect(inner.vertices).toBe(draft.vertices);
      return Dg.connect(inner, { from: `b`, to: `c` });
    });
    expect(Dg.hasOut(g2, `a`, `b`)).toBe(true);
    expect(Dg.hasOut(g2, `b`, `c`)).toBe(true);
    expect(g.vertices.isEmpty()).toBe(true);
  });
  it(`original graph is unchanged by batched connect & removeVertex`, () => {
    const g = Dg.graph({ from: `a`, to: [`b`, `c`], bidi: true });
    const g2 = Dg.removeVertex(g, `b`);
    expect(Dg.hasOut(g, `a`, `b`)).toBe(true);
    expect(g2.vertices.has(`b`)).toBe(false);
    expect(Dg.hasOut(g2, `a`, `b`)).toBe(false);
    expect(Dg.hasOut(g2, `c`, `a`)).toBe(true);
  });
});

describe(`undirected graph batching`, () => {
  it(`dedupes connections in either direction, returning existing edge`, () => {
    const g = Ug.graph({ a: `a`, b: [`b`, `c`] }, { a: `b`, b: `a` });
    expect(g.edges.length).toBe(2);
    const r = Ug.connectWithEdges(g, { a: `c`, b: [`a`, `d`] });
    expect(r.edges[0]).toBe(g.edges[1]);
    expect(r.graph.edges.length).toBe(3);
    expect(r.graph.vertices.has(`d`)).toBe(true);
    expect(g.vertices.has(`d`)).toBe(false);
  });
});

describe(`mapOfSimple`, () => {
  it(`versions don't affect each other`, () => {
    const a = ofSimple<string>().addKeyedValues(`k`, `1`, `2`);
    const b = a.addKeyedValues(`k`, `3`);
    const c = b.deleteKeyValue(`k`, `1`);
    expect([...a.valuesFor(`k`)]).toEqual([`1`, `2`]);
    expect([...b.valuesFor(`k`)]).toEqual([`1`, `2`, `3`]);
    expect([...c.valuesFor(`k`)]).toEqual([`2`, `3`]);
    expect(c.delete(`missing`)).toBe(c);
    expect(c.deleteByValue(`missing`)).toBe(c);
  });
  it(`addValue groups by key`, () => {
    const m = ofSimple<{ k: string; v: number }>(x => x.k).addValue({ k: `a`, v: 1 }, { k: `b`, v: 2 }, { k: `a`, v: 3 });
    expect(Array.from(m.valuesFor(`a`), x => x.v)).toEqual([1, 3]);
    expect(Array.from(m.valuesFor(`b`), x => x.v)).toEqual([2]);
  });
});
