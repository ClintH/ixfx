import { describe, test, expect } from 'vitest';
import * as D from '../../src/graph/dependency-graph.js';
import * as Directed from '../../src/graph/directed-graph.js';

/**
 * Classic spreadsheet:
 *   a, b are inputs
 *   c = a + b
 *   d = c * 2
 *   e = b + 1
 *   f = d + e
 */
const sheetGraph = () => D.graph(
  [ `c`, [ `a`, `b` ] ],
  [ `d`, [ `c` ] ],
  [ `e`, [ `b` ] ],
  [ `f`, [ `d`, `e` ] ]
);

const sorted = (s: Iterable<string>) => [ ...s ].sort();

/** Asserts `order` is a valid topological ordering for the given edges */
const expectBefore = (order: string[], before: string, after: string) => {
  expect(order.indexOf(before), `${ before } in ${ order }`).toBeGreaterThanOrEqual(0);
  expect(order.indexOf(before)).toBeLessThan(order.indexOf(after));
};

describe(`tracing`, () => {
  test(`direct precedents and dependents`, () => {
    const g = sheetGraph();
    expect(sorted(D.precedentsOf(g, `c`))).toEqual([ `a`, `b` ]);
    expect(sorted(D.precedentsOf(g, `f`))).toEqual([ `d`, `e` ]);
    expect(D.precedentsOf(g, `a`)).toEqual([]);
    expect(sorted(D.dependentsOf(g, `b`))).toEqual([ `c`, `e` ]);
    expect(D.dependentsOf(g, `f`)).toEqual([]);
  });

  test(`unknown nodes`, () => {
    const g = sheetGraph();
    expect(D.precedentsOf(g, `zz`)).toEqual([]);
    expect(D.dependentsOf(g, `zz`)).toEqual([]);
    expect(sorted(D.allDependents(g, `zz`))).toEqual([]);
    expect(sorted(D.allPrecedents(g, `zz`))).toEqual([]);
    expect(D.rootsOf(g, `zz`)).toEqual([]);
    expect(D.calculationOrder(g, `zz`)).toEqual([]);
    expect(D.recalculationOrder(g, [ `zz` ])).toEqual([]);
  });

  test(`transitive dependents`, () => {
    const g = sheetGraph();
    expect(sorted(D.allDependents(g, `a`))).toEqual([ `c`, `d`, `f` ]);
    expect(sorted(D.allDependents(g, `b`))).toEqual([ `c`, `d`, `e`, `f` ]);
    expect(sorted(D.allDependents(g, `f`))).toEqual([]);
  });

  test(`transitive precedents`, () => {
    const g = sheetGraph();
    expect(sorted(D.allPrecedents(g, `f`))).toEqual([ `a`, `b`, `c`, `d`, `e` ]);
    expect(sorted(D.allPrecedents(g, `e`))).toEqual([ `b` ]);
    expect(sorted(D.allPrecedents(g, `a`))).toEqual([]);
  });

  test(`roots: where to start calculating a derived value`, () => {
    const g = sheetGraph();
    expect(sorted(D.rootsOf(g, `f`))).toEqual([ `a`, `b` ]);
    expect(sorted(D.rootsOf(g, `e`))).toEqual([ `b` ]);
    expect(sorted(D.rootsOf(g, `d`))).toEqual([ `a`, `b` ]);
    // an input is its own root
    expect(D.rootsOf(g, `a`)).toEqual([ `a` ]);
  });

  test(`roots ignore irrelevant branches`, () => {
    const g = D.graph([ `x`, [ `p` ] ], [ `y`, [ `q` ] ]);
    expect(D.rootsOf(g, `x`)).toEqual([ `p` ]);
  });

  test(`diamond does not duplicate`, () => {
    const g = D.graph([ `b`, [ `a` ] ], [ `c`, [ `a` ] ], [ `d`, [ `b`, `c` ] ]);
    expect(sorted(D.allDependents(g, `a`))).toEqual([ `b`, `c`, `d` ]);
    expect(D.rootsOf(g, `d`)).toEqual([ `a` ]);
  });
});

describe(`ordering`, () => {
  test(`calculationOrder: precedents first, target last, nothing extra`, () => {
    const g = sheetGraph();
    const order = D.calculationOrder(g, `f`);
    expect(sorted(order)).toEqual([ `a`, `b`, `c`, `d`, `e`, `f` ]);
    expectBefore(order, `a`, `c`);
    expectBefore(order, `b`, `c`);
    expectBefore(order, `c`, `d`);
    expectBefore(order, `b`, `e`);
    expectBefore(order, `d`, `f`);
    expectBefore(order, `e`, `f`);
    expect(order.at(-1)).toBe(`f`);

    // e only needs b
    expect(D.calculationOrder(g, `e`)).toEqual([ `b`, `e` ]);
    expect(D.calculationOrder(g, `a`)).toEqual([ `a` ]);
  });

  test(`recalculationOrder: only affected nodes, in dependency order`, () => {
    const g = sheetGraph();
    const fromA = D.recalculationOrder(g, [ `a` ]);
    expect(sorted(fromA)).toEqual([ `c`, `d`, `f` ]);
    expectBefore(fromA, `c`, `d`);
    expectBefore(fromA, `d`, `f`);

    const fromB = D.recalculationOrder(g, [ `b` ]);
    expect(sorted(fromB)).toEqual([ `c`, `d`, `e`, `f` ]);
    expectBefore(fromB, `d`, `f`);
    expectBefore(fromB, `e`, `f`);

    expect(D.recalculationOrder(g, [ `f` ])).toEqual([]);
    expect(D.recalculationOrder(g, [])).toEqual([]);
  });

  test(`recalculationOrder with several changed nodes`, () => {
    const g = sheetGraph();
    const order = D.recalculationOrder(g, [ `a`, `b` ]);
    expect(sorted(order)).toEqual([ `c`, `d`, `e`, `f` ]);
    expectBefore(order, `c`, `d`);
  });

  test(`recalculationOrder when changed nodes are related`, () => {
    // changing c and d together: d is affected by c, so d is included
    const g = sheetGraph();
    const order = D.recalculationOrder(g, [ `c`, `d` ]);
    expect(sorted(order)).toEqual([ `d`, `f` ]);
    expectBefore(order, `d`, `f`);
  });

  test(`long chain does not overflow the stack`, () => {
    const n = 20000;
    // Build in one pass (incremental building copies the immutable map each time)
    const g = Directed.graphFromVertices(
      Array.from({ length: n + 1 }, (_, i) => ({
        id: `n${ i }`,
        out: i < n ? [ { id: `n${ i + 1 }` } ] : []
      }))
    );
    expect(D.allDependents(g, `n0`).size).toBe(n);
    expect(D.allPrecedents(g, `n${ n }`).size).toBe(n);
    expect(D.rootsOf(g, `n${ n }`)).toEqual([ `n0` ]);
    expect(D.recalculationOrder(g, [ `n0` ])[ 0 ]).toBe(`n1`);
  });
});

describe(`editing`, () => {
  test(`addDependency / removeDependency are immutable`, () => {
    const g1 = D.graph();
    const g2 = D.addDependency(g1, `b`, `a`);
    expect(D.dependentsOf(g1, `a`)).toEqual([]);
    expect(D.dependentsOf(g2, `a`)).toEqual([ `b` ]);
    const g3 = D.removeDependency(g2, `b`, `a`);
    expect(D.dependentsOf(g2, `a`)).toEqual([ `b` ]);
    expect(D.dependentsOf(g3, `a`)).toEqual([]);
    // nodes remain
    expect(g3.vertices.has(`a`)).toBe(true);
    expect(g3.vertices.has(`b`)).toBe(true);
  });

  test(`addDependency is idempotent`, () => {
    const g = D.addDependency(D.addDependency(D.graph(), `b`, `a`), `b`, `a`);
    expect(D.dependentsOf(g, `a`)).toEqual([ `b` ]);
  });

  test(`removeDependency with unknown nodes returns same graph`, () => {
    const g = sheetGraph();
    expect(D.removeDependency(g, `zz`, `a`)).toBe(g);
    expect(D.removeDependency(g, `c`, `zz`)).toBe(g);
  });

  test(`addNode`, () => {
    const g = D.addNode(D.graph(), `solo`);
    expect(g.vertices.has(`solo`)).toBe(true);
    expect(D.rootsOf(g, `solo`)).toEqual([ `solo` ]);
    expect(D.addNode(g, `solo`)).toBe(g);
  });

  test(`setPrecedents replaces old precedents`, () => {
    const g = D.setPrecedents(sheetGraph(), `c`, [ `b`, `x` ]);
    expect(sorted(D.precedentsOf(g, `c`))).toEqual([ `b`, `x` ]);
    expect(D.dependentsOf(g, `a`)).toEqual([]);
    expect(sorted(D.allPrecedents(g, `f`))).toEqual([ `b`, `c`, `d`, `e`, `x` ]);
  });

  test(`setPrecedents with empty list makes node an input`, () => {
    const g = D.setPrecedents(sheetGraph(), `c`, []);
    expect(D.precedentsOf(g, `c`)).toEqual([]);
    expect(D.rootsOf(g, `c`)).toEqual([ `c` ]);
  });
});

describe(`cycles`, () => {
  test(`wouldCycle`, () => {
    const g = sheetGraph();
    expect(D.wouldCycle(g, `a`, `a`)).toBe(true);
    expect(D.wouldCycle(g, `a`, `f`)).toBe(true);
    expect(D.wouldCycle(g, `c`, `d`)).toBe(true);
    expect(D.wouldCycle(g, `e`, `a`)).toBe(false);
    expect(D.wouldCycle(g, `f`, `a`)).toBe(false);
    expect(D.wouldCycle(g, `new`, `f`)).toBe(false);
  });

  test(`self reference throws`, () => {
    expect(() => D.addDependency(D.graph(), `a`, `a`)).toThrow(/Circular/);
  });

  test(`indirect cycle throws and leaves graph valid`, () => {
    const g = sheetGraph();
    expect(() => D.addDependency(g, `a`, `f`)).toThrow(/Circular/);
    expect(D.precedentsOf(g, `a`)).toEqual([]);
  });

  test(`setPrecedents cycle throws`, () => {
    expect(() => D.setPrecedents(sheetGraph(), `c`, [ `f` ])).toThrow(/Circular/);
  });
});

describe(`calculation engine`, () => {
  type S = D.CalcState<number>;

  /** Builds the sheet from above with formulas, tracking call counts */
  const build = () => {
    const calls: Record<string, number> = { c: 0, d: 0, e: 0, f: 0 };
    const count = (id: string, fn: D.Formula<number>): D.Formula<number> => get => {
      calls[ id ]++;
      return fn(get);
    };
    let s: S = D.calc<number>();
    s = D.setValue(s, `a`, 1).state;
    s = D.setValue(s, `b`, 2).state;
    s = D.setFormula(s, `c`, [ `a`, `b` ], count(`c`, g => g(`a`)! + g(`b`)!)).state;
    s = D.setFormula(s, `d`, [ `c` ], count(`d`, g => g(`c`)! * 2)).state;
    s = D.setFormula(s, `e`, [ `b` ], count(`e`, g => g(`b`)! + 1)).state;
    s = D.setFormula(s, `f`, [ `d`, `e` ], count(`f`, g => g(`d`)! + g(`e`)!)).state;
    for (const k of Object.keys(calls)) calls[ k ] = 0;
    return { s, calls };
  };

  test(`initial values`, () => {
    const { s } = build();
    expect(D.getValue(s, `c`)).toBe(3);
    expect(D.getValue(s, `d`)).toBe(6);
    expect(D.getValue(s, `e`)).toBe(3);
    expect(D.getValue(s, `f`)).toBe(9);
    expect(D.getValue(s, `nope`)).toBeUndefined();
  });

  test(`changing an input recalculates only its dependents`, () => {
    const { s, calls } = build();
    const r = D.setValue(s, `a`, 10);
    expect(D.getValue(r.state, `c`)).toBe(12);
    expect(D.getValue(r.state, `d`)).toBe(24);
    expect(D.getValue(r.state, `f`)).toBe(27);
    expect(D.getValue(r.state, `e`)).toBe(3);
    expect(r.recalculated).toEqual([ `c`, `d`, `f` ]);
    expect(calls).toEqual({ c: 1, d: 1, e: 0, f: 1 });
  });

  test(`each node recalculated once even with diamond`, () => {
    const { s, calls } = build();
    const r = D.setValue(s, `b`, 5);
    expect(sorted(r.recalculated)).toEqual([ `c`, `d`, `e`, `f` ]);
    expect(calls).toEqual({ c: 1, d: 1, e: 1, f: 1 });
    // f = (1+5)*2 + (5+1)
    expect(D.getValue(r.state, `f`)).toBe(18);
    // f must be computed after d and e
    expect(r.recalculated.at(-1)).toBe(`f`);
  });

  test(`setting an unchanged value does nothing`, () => {
    const { s, calls } = build();
    const r = D.setValue(s, `a`, 1);
    expect(r.recalculated).toEqual([]);
    expect(calls).toEqual({ c: 0, d: 0, e: 0, f: 0 });
  });

  test(`early cut-off: unchanged intermediate stops propagation`, () => {
    // parity = n % 2; label = parity === 0 ? 'even' : 'odd'
    const calls = { parity: 0, label: 0 };
    let s = D.calc<number | string>();
    s = D.setValue(s, `n`, 2).state;
    s = D.setFormula(s, `parity`, [ `n` ], get => {
      calls.parity++;
      return (get(`n`) as number) % 2;
    }).state;
    s = D.setFormula(s, `label`, [ `parity` ], get => {
      calls.label++;
      return get(`parity`) === 0 ? `even` : `odd`;
    }).state;
    calls.parity = 0; calls.label = 0;

    // 2 -> 4: parity recalculated but still 0, so label is skipped
    const r1 = D.setValue(s, `n`, 4);
    expect(r1.recalculated).toEqual([ `parity` ]);
    expect(calls).toEqual({ parity: 1, label: 0 });
    expect(D.getValue(r1.state, `label`)).toBe(`even`);

    // 4 -> 5: parity changes so label recalculates
    const r2 = D.setValue(r1.state, `n`, 5);
    expect(r2.recalculated).toEqual([ `parity`, `label` ]);
    expect(D.getValue(r2.state, `label`)).toBe(`odd`);
  });

  test(`a node recalculates if any one precedent changed`, () => {
    // f depends on d and e; changing a changes d but not e; f must still recalc
    const { s } = build();
    const r = D.setValue(s, `a`, 5);
    expect(r.recalculated).toContain(`f`);
  });

  test(`custom equality`, () => {
    const eq = (a: { v: number }, b: { v: number }) => a.v === b.v;
    let s = D.calc<{ v: number }>(eq);
    s = D.setValue(s, `a`, { v: 1 }).state;
    let runs = 0;
    s = D.setFormula(s, `b`, [ `a` ], get => {
      runs++;
      return { v: get(`a`)!.v + 1 };
    }).state;
    runs = 0;
    // new object, equal by value
    const r = D.setValue(s, `a`, { v: 1 });
    expect(r.recalculated).toEqual([]);
    expect(runs).toBe(0);
    // Object.is default would have treated these as different
    expect(D.setValue(D.calc<{ v: number }>(), `a`, { v: 1 }).recalculated).toEqual([]);
  });

  test(`state is immutable`, () => {
    const { s } = build();
    const r = D.setValue(s, `a`, 100);
    expect(D.getValue(s, `a`)).toBe(1);
    expect(D.getValue(s, `f`)).toBe(9);
    expect(D.getValue(r.state, `a`)).toBe(100);
  });

  test(`redefining a formula updates value and dependents`, () => {
    const { s } = build();
    // c = a * b * 10 -> 1*2*10 = 20
    const r = D.setFormula(s, `c`, [ `a`, `b` ], g => g(`a`)! * g(`b`)! * 10);
    expect(D.getValue(r.state, `c`)).toBe(20);
    expect(D.getValue(r.state, `d`)).toBe(40);
    expect(D.getValue(r.state, `f`)).toBe(43);
    expect(r.recalculated[ 0 ]).toBe(`c`);
    expect(r.recalculated.slice(1)).toEqual([ `d`, `f` ]);
  });

  test(`redefining with the same result does not propagate`, () => {
    const { s, calls } = build();
    const r = D.setFormula(s, `c`, [ `a`, `b` ], g => g(`a`)! + g(`b`)! + 0);
    expect(r.recalculated).toEqual([ `c` ]);
    expect(calls.d).toBe(0);
  });

  test(`redefining formula changes precedents`, () => {
    const { s } = build();
    // c now only depends on b
    const r1 = D.setFormula(s, `c`, [ `b` ], g => g(`b`)! * 100);
    expect(sorted(D.precedentsOf(r1.state.graph, `c`))).toEqual([ `b` ]);
    // changing a no longer affects anything
    const r2 = D.setValue(r1.state, `a`, 999);
    expect(r2.recalculated).toEqual([]);
  });

  test(`adding a formula over missing precedent values`, () => {
    let s = D.calc<number>();
    // `x` has no value; formula sees undefined
    const r = D.setFormula(s, `y`, [ `x` ], g => (g(`x`) ?? -1) + 1);
    expect(D.getValue(r.state, `y`)).toBe(0);
    s = D.setValue(r.state, `x`, 9).state;
    expect(D.getValue(s, `y`)).toBe(10);
  });

  test(`new formula on top of a never-evaluated formula chain evaluates precedents`, () => {
    // Build graph-first state by hand: p has a formula but no cached value
    const base = D.calc<number>();
    const withP: S = {
      ...base,
      graph: D.graph([ `p`, [ `in` ] ]),
      formulas: new Map([ [ `p`, g => (g(`in`) ?? 0) + 1 ] ]),
      values: new Map([ [ `in`, 4 ] ])
    };
    const r = D.setFormula(withP, `q`, [ `p` ], g => g(`p`)! * 2);
    expect(D.getValue(r.state, `p`)).toBe(5);
    expect(D.getValue(r.state, `q`)).toBe(10);
    expect(r.recalculated).toEqual([ `p`, `q` ]);
  });

  test(`circular formula throws and original state is intact`, () => {
    const { s } = build();
    expect(() => D.setFormula(s, `a`, [ `f` ], g => g(`f`)!)).toThrow(/Circular/);
    expect(() => D.setFormula(s, `c`, [ `c` ], g => g(`c`)!)).toThrow(/Circular/);
    expect(D.getValue(s, `a`)).toBe(1);
    expect(D.precedentsOf(s.graph, `a`)).toEqual([]);
  });

  test(`setValue on a derived node throws`, () => {
    const { s } = build();
    expect(() => D.setValue(s, `c`, 1)).toThrow(/formula/);
  });

  test(`turning an input into derived, then updating`, () => {
    const { s } = build();
    const r1 = D.setFormula(s, `a`, [ `b` ], g => g(`b`)! * 10);
    expect(D.getValue(r1.state, `a`)).toBe(20);
    expect(D.getValue(r1.state, `c`)).toBe(22);
    const r2 = D.setValue(r1.state, `b`, 3);
    expect(D.getValue(r2.state, `a`)).toBe(30);
    expect(D.getValue(r2.state, `c`)).toBe(33);
  });

  test(`results match a full recalculation after many random edits`, () => {
    const { s: start } = build();
    let s: S = start;
    // simple deterministic pseudo-random
    let seed = 42;
    const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
    for (let i = 0; i < 200; i++) {
      const id = rnd() < 0.5 ? `a` : `b`;
      s = D.setValue(s, id, Math.floor(rnd() * 10)).state;
      const a = D.getValue(s, `a`)!, b = D.getValue(s, `b`)!;
      expect(D.getValue(s, `f`)).toBe((a + b) * 2 + (b + 1));
    }
  });
});
