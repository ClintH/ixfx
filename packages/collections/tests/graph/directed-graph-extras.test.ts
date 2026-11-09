/* eslint-disable ts/no-non-null-assertion */
import { describe, expect, it } from 'vitest';
import * as Dg from '../../src/graph/directed-graph.js';

const ids = (it: Iterable<Dg.Vertex>) => Array.from(it, v => v.id);
const sortedIds = (it: Iterable<Dg.Vertex>) => ids(it).sort();

// a -> b -> c -> d, plus x -> c and an isolated vertex z
function sample() {
  let g = Dg.graph(
    { from: `a`, to: `b` },
    { from: `b`, to: `c` },
    { from: `c`, to: `d` },
    { from: `x`, to: `c`, weight: 3 },
  );
  g = Dg.getOrCreate(g, `z`).graph;
  return g;
}

describe(`cycles`, () => {
  it(`self-loop is a cycle`, () => {
    const g = Dg.graph({ from: `a`, to: `a` }, { from: `a`, to: `b` });
    const cycles = Dg.getCycles(g);
    expect(cycles.length).toBe(1);
    expect(cycles[0].map(v => v.id)).toEqual([`a`]);
    expect(Dg.isAcyclic(g)).toBe(false);
    expect(() => Dg.topologicalSort(g)).toThrow(/cycles/);
  });

  it(`single vertex without self-loop is not a cycle`, () => {
    expect(Dg.isAcyclic(sample())).toBe(true);
  });

  it(`large graphs don't overflow the stack`, () => {
    const n = 20_000;
    const chain = Dg.graph(...Array.from({ length: n }, (_, i) => ({ from: `v${i}`, to: `v${i + 1}` })));
    expect(Dg.isAcyclic(chain)).toBe(true);
    const loop = Dg.connect(chain, { from: `v${n}`, to: `v0` });
    const cycles = Dg.getCycles(loop);
    expect(cycles.length).toBe(1);
    expect(cycles[0].length).toBe(n + 1);
  });

  it(`bfs does not revisit start via a cycle`, () => {
    const g = Dg.graph({ from: `a`, to: `b` }, { from: `b`, to: `a` });
    expect(ids(Dg.bfs(g, `a`))).toEqual([`a`, `b`]);
    const self = Dg.graph({ from: `a`, to: `a` });
    expect(ids(Dg.bfs(self, `a`))).toEqual([`a`]);
  });
});

describe(`removeVertex`, () => {
  it(`removes vertex and incoming edges`, () => {
    const g = sample();
    const g2 = Dg.removeVertex(g, `c`);
    expect(g2.vertices.has(`c`)).toBe(false);
    expect(Dg.get(g2, `b`)!.out).toEqual([]);
    expect(Dg.get(g2, `x`)!.out).toEqual([]);
    expect(g2.vertices.has(`d`)).toBe(true);
    // original untouched
    expect(g.vertices.has(`c`)).toBe(true);
    expect(Dg.hasOut(g, `b`, `c`)).toBe(true);
  });

  it(`accepts a vertex, handles self-loop, ignores missing`, () => {
    const g = Dg.graph({ from: `a`, to: `a` }, { from: `b`, to: `a` });
    const g2 = Dg.removeVertex(g, Dg.get(g, `a`)!);
    expect(ids(Dg.vertices(g2))).toEqual([`b`]);
    expect(Dg.removeVertex(g, `nope`)).toBe(g);
    expect(() => Dg.removeVertex(g, ``)).toThrow();
  });
});

describe(`incoming`, () => {
  it(`incoming and inDegree`, () => {
    const g = sample();
    expect(sortedIds(Dg.incoming(g, `c`))).toEqual([`b`, `x`]);
    expect(Dg.inDegree(g, `c`)).toBe(2);
    expect(Dg.inDegree(g, Dg.get(g, `a`)!)).toBe(0);
    expect(ids(Dg.incoming(g, `z`))).toEqual([]);
    expect(() => Dg.inDegree(g, `nope`)).toThrow();
  });
});

describe(`reachability`, () => {
  it(`hasPath`, () => {
    const g = sample();
    expect(Dg.hasPath(g, `a`, `d`)).toBe(true);
    expect(Dg.hasPath(g, `d`, `a`)).toBe(false);
    expect(Dg.hasPath(g, `x`, `b`)).toBe(false);
    expect(Dg.hasPath(g, `z`, `z`)).toBe(true);
    expect(() => Dg.hasPath(g, `a`, `nope`)).toThrow();
  });

  it(`hasPath predicts cycles from connecting`, () => {
    const g = sample();
    // Connecting d -> a would create a cycle iff hasPath(a, d)
    expect(Dg.hasPath(g, `a`, `d`)).toBe(true);
    expect(Dg.isAcyclic(Dg.connect(g, { from: `d`, to: `a` }))).toBe(false);
    // Self-connection is a cycle, and hasPath(a,a) is true
    expect(Dg.isAcyclic(Dg.connect(g, { from: `a`, to: `a` }))).toBe(false);
  });

  it(`descendants and ancestors`, () => {
    const g = sample();
    expect(ids(Dg.descendants(g, `a`))).toEqual([`b`, `c`, `d`]);
    expect(ids(Dg.descendants(g, `d`))).toEqual([]);
    expect(sortedIds(Dg.ancestors(g, `d`))).toEqual([`a`, `b`, `c`, `x`]);
    // nearest first
    expect(ids(Dg.ancestors(g, `d`))[0]).toBe(`c`);
    expect(ids(Dg.ancestors(g, `z`))).toEqual([]);
  });

  it(`start included only when on a cycle`, () => {
    const g = Dg.graph({ from: `a`, to: `b` }, { from: `b`, to: `a` }, { from: `b`, to: `c` });
    expect(sortedIds(Dg.descendants(g, `a`))).toEqual([`a`, `b`, `c`]);
    expect(sortedIds(Dg.ancestors(g, `a`))).toEqual([`a`, `b`]);
    expect(ids(Dg.descendants(g, `c`))).toEqual([]);
  });

  it(`transpose`, () => {
    const g = sample();
    const t = Dg.transpose(g);
    expect(sortedIds(Dg.vertices(t))).toEqual(sortedIds(Dg.vertices(g)));
    expect(Dg.hasOnlyOuts(t, `c`, `b`, `x`)).toBe(true);
    expect(Dg.get(t, `c`)!.out.find(e => e.id === `x`)!.weight).toBe(3);
    expect(Dg.get(t, `a`)!.out).toEqual([]);
    // transposing twice gives back the same edges
    expect(Dg.toJson(Dg.transpose(t)).vertices.map(v => v.out).flat().length).toBe(4);
    expect(sortedIds(Dg.ancestors(g, `d`))).toEqual(sortedIds(Dg.descendants(t, `d`)));
  });
});

describe(`topologicalSortTry`, () => {
  it(`success`, () => {
    const r = Dg.topologicalSortTry(Dg.graph({ from: `b`, to: `c` }, { from: `a`, to: `b` }));
    expect(r.success).toBe(true);
    if (r.success)
      expect(ids(Dg.vertices(r.value))).toEqual([`a`, `b`, `c`]);
  });

  it(`returns cycles instead of throwing`, () => {
    const g = Dg.graph({ from: `a`, to: `b` }, { from: `b`, to: `a` }, { from: `c`, to: `c` }, { from: `d`, to: `a` });
    const r = Dg.topologicalSortTry(g);
    expect(r.success).toBe(false);
    if (!r.success) {
      const cycles = r.error.map(c => c.map(v => v.id).sort());
      expect(cycles).toContainEqual([`a`, `b`]);
      expect(cycles).toContainEqual([`c`]);
      expect(cycles.length).toBe(2);
    }
  });
});

describe(`json`, () => {
  it(`round-trips through JSON, structuredClone`, () => {
    const g = sample();
    const json = Dg.toJson(g);
    expect(json.vertices.find(v => v.id === `x`)!.out).toEqual([{ id: `c`, weight: 3 }]);
    expect(`weight` in json.vertices[0].out[0]).toBe(false);

    const viaText = Dg.fromJson(JSON.parse(JSON.stringify(json)));
    expect(Dg.dumpGraph(viaText)).toBe(Dg.dumpGraph(g));
    expect(Dg.toJson(viaText)).toEqual(json);

    const viaClone = Dg.fromJson(structuredClone(json));
    expect(Dg.toJson(viaClone)).toEqual(json);
  });

  it(`fromJson creates referenced vertices and collapses duplicate edges`, () => {
    const g = Dg.fromJson({ vertices: [{ id: `a`, out: [{ id: `b`, weight: 1 }, { id: `b`, weight: 2 }] }] });
    expect(ids(Dg.vertices(g))).toEqual([`a`, `b`]);
    expect(Dg.get(g, `a`)!.out).toEqual([{ id: `b`, weight: 1 }]);
  });

  it(`fromJson validates`, () => {
    // @ts-expect-error testing null input
    expect(() => Dg.fromJson(null)).toThrow();
    // @ts-expect-error testing missing vertices
    expect(() => Dg.fromJson({})).toThrow();
    expect(() => Dg.fromJson({ vertices: [{ id: `a`, out: [] }, { id: `a`, out: [] }] })).toThrow(/more than once/);
    expect(() => Dg.fromJson({ vertices: [{ id: ``, out: [] }] })).toThrow();
    // @ts-expect-error testing non-numeric weight
    expect(() => Dg.fromJson({ vertices: [{ id: `a`, out: [{ id: `b`, weight: `heavy` }] }] })).toThrow(/weight/);
    // @ts-expect-error testing non-array out
    expect(() => Dg.fromJson({ vertices: [{ id: `a`, out: `b` }] })).toThrow();
  });
});

describe(`withMutations`, () => {
  it(`batch changes leave original untouched`, () => {
    const g = sample();
    const before = Dg.dumpGraph(g);
    const g2 = Dg.withMutations(g, (draft) => {
      draft = Dg.connect(draft, { from: `d`, to: `e` });
      draft = Dg.removeVertex(draft, `x`);
      draft = Dg.disconnect(draft, `a`, `b`);
      return draft;
    });
    expect(Dg.dumpGraph(g)).toBe(before);
    expect(Dg.hasOut(g2, `d`, `e`)).toBe(true);
    expect(g2.vertices.has(`x`)).toBe(false);
    expect(Dg.hasOut(g2, `a`, `b`)).toBe(false);
    // Result is a normal immutable graph
    const g3 = Dg.connect(g2, { from: `e`, to: `f` });
    expect(g2.vertices.has(`f`)).toBe(false);
    expect(g3.vertices.has(`f`)).toBe(true);
  });

  it(`leaked draft throws`, () => {
    let leaked: Dg.DirectedGraph | undefined;
    Dg.withMutations(Dg.graph(), (draft) => {
      leaked = draft;
      return draft;
    });
    expect(() => Dg.connect(leaked!, { from: `a`, to: `b` })).toThrow(/withMutations/);
  });

  it(`callback must return a graph`, () => {
    // @ts-expect-error testing callback without a return value
    expect(() => Dg.withMutations(Dg.graph(), () => undefined)).toThrow();
  });

  it(`graph() builds large graphs quickly`, () => {
    const n = 20_000;
    const connections = Array.from({ length: n }, (_, i) => ({ from: `v${i}`, to: `v${i + 1}` }));
    const started = performance.now();
    const g = Dg.graph(...connections);
    const elapsed = performance.now() - started;
    expect([...Dg.vertices(g)].length).toBe(n + 1);
    // Quadratic copying would take many seconds for this size
    expect(elapsed).toBeLessThan(2000);
  });
});
