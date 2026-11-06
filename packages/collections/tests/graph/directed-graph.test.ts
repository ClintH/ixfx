/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { test, expect, assert } from 'vitest';
import * as Dg from '../../src/graph/directed-graph.js';
import { join } from 'path';

const linearGraph = () => {
  return Dg.graph(
    { from: `a`, to: `b` },
    { from: `b`, to: `c` },
    { from: `c`, to: `d` }
  )
};

test(`has-no-outs`, () => {
  const g = linearGraph();
  expect(Dg.hasNoOuts(g, `a`)).toBeFalsy();
  expect(Dg.hasNoOuts(g, `d`)).toBeTruthy();
});

test(`has-only-outs`, () => {
  const g1 = circularGraph();
  expect(Dg.hasOnlyOuts(g1, `a`, `b`)).toBeTruthy();


  const g2 = linearGraph();
  expect(Dg.hasOnlyOuts(g2, `a`, `b`)).toBeTruthy();
  expect(Dg.hasOnlyOuts(g2, `a`, `c`)).toBeFalsy();

});

const circularGraph = () => {
  return Dg.graph(
    { from: `a`, to: `b` },
    { from: `b`, to: `c` },
    { from: `c`, to: `d` },
    { from: `d`, to: `a` }
  )
}

test(`has-key`, () => {
  const g = linearGraph();
  expect(Dg.hasKey(g, `a`)).toBeTruthy();
  expect(Dg.hasKey(g, `b`)).toBeTruthy();
  expect(Dg.hasKey(g, `c`)).toBeTruthy();
  expect(Dg.hasKey(g, `d`)).toBeTruthy();
  expect(Dg.hasKey(g, `e`)).toBeFalsy();
});

test(`get`, () => {
  const g = linearGraph();
  expect(Dg.get(g, `a`)).toEqual({
    id: `a`,
    out: [ {
      id: `b`,
      weight: undefined
    } ]
  });

  expect(Dg.get(g, `e`)).toBeFalsy();
});

test(`dump-graph`, () => {
  const g = linearGraph();
  expect(Dg.dumpGraph(g)).toBe([
    ` a`,
    `  -> b`,
    ` b`,
    `  -> c`,
    ` c`,
    `  -> d`,
    ` d (terminal)` ].join('\n'));
});

test(`distance`, () => {
  const g = linearGraph();
  expect(Dg.distance(g, { id: `a`, weight: 2 })).toEqual(2);
  expect(Dg.distance(g, { id: `a` })).toEqual(1);

});

test(`vertex-has-out`, () => {
  const g = linearGraph();
  const v = Dg.get(g, `a`);
  expect(Dg.vertexHasOut(v!, `b`)).toBeTruthy();
  expect(Dg.vertexHasOut(v!, `c`)).toBeFalsy();
});

test(`errors`, () => {
  // @ts-expect-error
  expect(() => Dg.graph(undefined)).throws();
  // @ts-expect-error
  expect(() => Dg.graph(null)).throws();

  // @ts-expect-error
  expect(() => Dg.graph(10)).throws();
  // @ts-expect-error
  expect(() => Dg.graph("blah")).throws();

})

test(`toAdjacencyMatrix`, () => {
  // Directed
  const g = Dg.graph(
    { from: `0`, to: [ `1`, `2`, `3` ] },
    { from: `2`, to: `1` }
  );
  const m = Dg.toAdjacencyMatrix(g);
  expect(m.row(0)).toEqual([ false, true, true, true ]);
  expect(m.row(1)).toEqual([ false, false, false, false ]);
  expect(m.row(2)).toEqual([ false, true, false, false ]);
  expect(m.row(3)).toEqual([ false, false, false, false ]);
});

test(`topologicalSort`, t => {
  // Case 1: https://mohammad-imran.medium.com/understanding-topological-sorting-with-kahns-algo-8af5a588dd0e
  const g = Dg.graph(
    { from: `a`, to: [ `d`, `b` ] },
    { from: `b`, to: [ `d`, `c` ] }
  );
  const s1 = Dg.topologicalSort(g);
  expect(Dg.hasOut(s1, `a`, `d`)).toBeTruthy();
  expect(Dg.hasOut(s1, `a`, `b`)).toBeTruthy();
  expect(Dg.hasOut(s1, `b`, `d`)).toBeTruthy();
  expect(Dg.hasOut(s1, `b`, `c`)).toBeTruthy();
  expect(Dg.hasNoOuts(s1, `d`)).toBeTruthy();
  expect(Dg.hasNoOuts(s1, `c`)).toBeTruthy();
});

test(`isAcyclic`, () => {
  // Graph from: https://en.wikipedia.org/wiki/Directed_acyclic_graph
  const g = Dg.graph(
    { from: `a`, to: [ `b`, `c`, `d`, `e` ] },
    { from: `b`, to: `d` },
    { from: `c`, to: [ `d`, `e` ] },
    { from: `d`, to: `e` }
  );

  // True, no loops
  expect(Dg.isAcyclic(g)).toBeTruthy();

  // True: straight line
  expect(Dg.isAcyclic(linearGraph())).toBeTruthy();

  // False: loops
  expect(Dg.isAcyclic(circularGraph())).toBeFalsy();
});

test(`bfs`, () => {
  // Case 1: https://en.wikipedia.org/wiki/Breadth-first_search
  const g = Dg.graph(
    { from: `1`, to: [ `2`, `3`, `4` ] },
    { from: `2`, to: [ `5`, `6` ] },
    { from: `4`, to: [ `7`, `8` ] },
    { from: `5`, to: [ `9`, `10` ] },
    { from: `4`, to: `7` },
    { from: `7`, to: [ `11`, `12` ] }
  );
  const order = [ ...Dg.bfs(g, `1`) ].map(v => v.id).join(` `);
  expect(order).toEqual(`1 2 3 4 5 6 7 8 9 10 11 12`);
});

test(`transitiveReduction`, () => {
  // In this case, the edge A->B is redundant, because B depends on C.
  const g1 = Dg.graph(
    { from: `a`, to: [ `b`, `c`, `d` ] },
    { from: `c`, to: `b` },
    { from: `d`, to: `e` },
    { from: `e`, to: `b` }
  );
  const r1 = Dg.transitiveReduction(g1);

  expect(Dg.hasOnlyOuts(r1, `a`, `d`, `c`)).toBeTruthy();
  expect(Dg.hasNoOuts(r1, `b`)).toBeTruthy();
  expect(Dg.hasOnlyOuts(r1, `c`, `b`)).toBeTruthy();
  expect(Dg.hasOnlyOuts(r1, `d`, `e`)).toBeTruthy();
  expect(Dg.hasOnlyOuts(r1, `e`, `b`)).toBeTruthy();

  // Case 2 https://en.wikipedia.org/wiki/Transitive_reduction
  const g2 = Dg.graph(
    { from: `a`, to: [ `b`, `c`, `e` ] },
    { from: `b`, to: `d` },
    { from: `c`, to: [ `d`, `e` ] },
    { from: `d`, to: `e` }
  );
  const r2 = Dg.transitiveReduction(g2);
  expect(Dg.hasOnlyOuts(r2, `a`, `b`, `c`)).toBeTruthy();
  expect(Dg.hasOnlyOuts(r2, `b`, `d`)).toBeTruthy();
  expect(Dg.hasOnlyOuts(r2, `c`, `d`)).toBeTruthy();
  expect(Dg.hasOnlyOuts(r2, `d`, `e`)).toBeTruthy();
  expect(Dg.hasNoOuts(r2, `e`));
});

test(`cycles`, () => {
  // Graph from https://en.wikipedia.org/wiki/Strongly_connected_component
  const g = Dg.graph(
    { from: `a`, to: `b` },
    { from: `b`, to: [ `e`, `f`, `c` ] },
    { from: `c`, to: [ `d`, `g` ] },
    { from: `d`, to: [ `c`, `h` ] },
    { from: `e`, to: [ `a`, `f` ] },
    { from: `f`, to: `g` },
    { from: `g`, to: `f` },
    { from: `h`, to: `d` }
  )
  const sets = Dg.getCycles(g);
  const setsToIds = sets.map(set => {
    return set.map(s => s.id).sort();
  });

  assert.sameDeepMembers(setsToIds.sort(), [
    [ `a`, `b`, `e` ],
    [ `c`, `d`, `h` ],
    [ `f`, `g` ]
  ]);
});

test(`connect`, t => {
  const g = Dg.graph(
    { from: `a`, to: `b` },
    { from: `a`, to: `c` }
  );

  expect(Dg.hasOut(g, `a`, `b`)).toBeTruthy();
  expect(Dg.hasOut(g, `a`, `c`)).toBeTruthy();
});

test(`dfs`, () => {
  const g = Dg.graph(
    { from: `1`, to: `6`, weight: 14 },
    { from: `1`, to: `3`, weight: 9 },
    { from: `1`, to: `2`, weight: 7 },

    { from: `6`, to: `5`, weight: 9 },
    { from: `6`, to: `3`, weight: 2 },

    { from: `2`, to: `3`, weight: 10 },
    { from: `2`, to: `4`, weight: 15 },

    { from: `4`, to: `5`, weight: 6 },

    { from: `5`, to: `7`, weight: 6 }
  );

  const path = [ ...Dg.dfs(g, `1`) ];
  expect(path.length).eq(7);
});


test(`pathDijkstra`, () => {
  const g = Dg.graph(
    { from: `1`, to: `6`, weight: 14 },
    { from: `1`, to: `3`, weight: 9 },
    { from: `1`, to: `2`, weight: 7 },
    { from: `6`, to: `5`, weight: 9 },
    { from: `6`, to: `3`, weight: 2 },
    { from: `2`, to: `3`, weight: 10 },
    { from: `2`, to: `4`, weight: 15 },
    { from: `4`, to: `5`, weight: 6 },
    { from: `5`, to: `7`, weight: 6 }
  );
  const { distances, previous, pathTo } = Dg.pathDijkstra(g, `1`);
  expect(distances.get(`1`)).eq(0);
  expect(distances.get(`2`)).eq(7);
  expect(distances.get(`3`)).eq(9);
  expect(distances.get(`6`)).eq(14);
  expect(distances.get(`4`)).eq(22);
  expect(distances.get(`5`)).eq(23);
  expect(distances.get(`7`)).eq(29);
  expect(previous.get(`5`)?.id).eq(`6`);
  expect(previous.get(`2`)?.id).eq(`1`);

  // Path is destination-first
  expect(pathTo(`7`).map(e => e.id)).toEqual([ `7`, `5`, `6` ]);
  expect(pathTo(`1`)).toEqual([]);
});

test(`pathDijkstra-shortcut-and-unreachable`, () => {
  // 1->3 direct (9) is longer than 1->2->3 (8)
  const g = Dg.graph(
    { from: `1`, to: `3`, weight: 9 },
    { from: `1`, to: `2`, weight: 7 },
    { from: `2`, to: `3`, weight: 1 },
    { from: `x`, to: `1` }
  );
  const { distances, pathTo } = Dg.pathDijkstra(g, `1`);
  expect(distances.get(`3`)).eq(8);
  expect(pathTo(`3`).map(e => e.id)).toEqual([ `3`, `2` ]);
  // x only has an edge *into* 1, so is unreachable
  expect(distances.get(`x`)).eq(Number.MAX_SAFE_INTEGER);
  expect(() => pathTo(`x`)).toThrow();
  expect(() => pathTo(`nope`)).toThrow();
});

test(`pathDijkstra-source`, () => {
  const g = linearGraph();
  expect(() => Dg.pathDijkstra(g, `zzz`)).toThrow();
  const viaVertex = Dg.pathDijkstra(g, Dg.get(g, `b`)!);
  expect(viaVertex.distances.get(`d`)).eq(2);
  // default weight is 1
  expect(viaVertex.distances.get(`a`)).eq(Number.MAX_SAFE_INTEGER);
});

test(`bfs-cycle-visits-once`, () => {
  expect([ ...Dg.bfs(circularGraph(), `a`) ].map(v => v.id)).toEqual([ `a`, `b`, `c`, `d` ]);
});

test(`bfs-target`, () => {
  const g = linearGraph();
  expect([ ...Dg.bfs(g, `a`, `c`) ].map(v => v.id)).toEqual([ `a`, `b`, `c` ]);
  expect([ ...Dg.bfs(g, `a`, Dg.get(g, `b`)!) ].map(v => v.id)).toEqual([ `a`, `b` ]);
  expect(() => [ ...Dg.bfs(g, `nope`) ]).toThrow();
});

test(`dfs-cycle-and-errors`, () => {
  expect([ ...Dg.dfs(circularGraph(), `a`) ].map(v => v.id)).toEqual([ `a`, `b`, `c`, `d` ]);
  expect(() => [ ...Dg.dfs(linearGraph(), `nope`) ]).toThrow();
});

test(`connect-options`, () => {
  // bidi
  const g1 = Dg.connect(Dg.graph(), { from: `a`, to: [ `b`, `c` ], bidi: true });
  expect(Dg.hasOut(g1, `a`, `b`)).toBe(true);
  expect(Dg.hasOut(g1, `b`, `a`)).toBe(true);
  expect(Dg.hasOut(g1, `c`, `a`)).toBe(true);
  expect(Dg.hasOut(g1, `b`, `c`)).toBe(false);

  // weight
  const g2 = Dg.connect(Dg.graph(), { from: `a`, to: `b`, weight: 5 });
  expect(Dg.get(g2, `a`)!.out[ 0 ].weight).toBe(5);

  // duplicate connect does not duplicate edges
  const g3 = Dg.connect(g2, { from: `a`, to: `b` });
  expect(Dg.get(g3, `a`)!.out.length).toBe(1);
});

test(`connectWithEdges-and-connectTo`, () => {
  const r = Dg.connectWithEdges(Dg.graph(), { from: `a`, to: [ `b`, `c` ], bidi: true, weight: 2 });
  expect(r.edges.map(e => e.id)).toEqual([ `b`, `c`, `a`, `a` ]);
  expect(r.edges.every(e => e.weight === 2)).toBe(true);

  const t = Dg.connectTo(Dg.graph(), `x`, `y`, 3);
  expect(t.edge).toEqual({ id: `y`, weight: 3 });
  expect(Dg.hasOut(t.graph, `x`, `y`)).toBe(true);
  expect(Dg.hasKey(t.graph, `y`)).toBe(true);
});

test(`connect-validates-params`, () => {
  // @ts-expect-error
  expect(() => Dg.connect(undefined, { from: `a`, to: `b` })).toThrow();
  // @ts-expect-error
  expect(() => Dg.connect(Dg.graph(), undefined)).toThrow();
});

test(`immutability`, () => {
  const g1 = linearGraph();
  const g2 = Dg.connect(g1, { from: `d`, to: `e` });
  expect(Dg.hasKey(g1, `e`)).toBe(false);
  expect(Dg.hasKey(g2, `e`)).toBe(true);
  const g3 = Dg.disconnect(g2, `a`, `b`);
  expect(Dg.hasOut(g2, `a`, `b`)).toBe(true);
  expect(Dg.hasOut(g3, `a`, `b`)).toBe(false);
});

test(`disconnect`, () => {
  const g = linearGraph();
  const g2 = Dg.disconnect(g, `a`, `b`);
  expect(Dg.hasNoOuts(g2, `a`)).toBe(true);
  expect(Dg.hasKey(g2, `b`)).toBe(true);
  // Disconnecting a non-existent edge returns the same graph
  expect(Dg.disconnect(g, `a`, `c`)).toBe(g);
  expect(() => Dg.disconnect(g, `a`, `nope`)).toThrow();
  expect(() => Dg.disconnect(g, `nope`, `a`)).toThrow();
});

test(`getOrCreate-getOrFail`, () => {
  const g = linearGraph();
  const existing = Dg.getOrCreate(g, `a`);
  expect(existing.graph).toBe(g);
  expect(existing.vertex.id).toBe(`a`);

  const created = Dg.getOrCreate(g, `z`);
  expect(Dg.hasKey(created.graph, `z`)).toBe(true);
  expect(Dg.hasKey(g, `z`)).toBe(false);

  expect(Dg.getOrFail(g, `a`).id).toBe(`a`);
  expect(() => Dg.getOrFail(g, `z`)).toThrow();
});

test(`createVertex-and-updateGraphVertex`, () => {
  expect(Dg.createVertex(`q`)).toEqual({ id: `q`, out: [] });
  const g = Dg.updateGraphVertex(linearGraph(), { id: `a`, out: [ { id: `d` } ] });
  expect(Dg.hasOnlyOuts(g, `a`, `d`)).toBe(true);
});

test(`adjacency`, () => {
  const g = linearGraph();
  expect([ ...Dg.adjacentVertices(g, `a`) ].map(v => v.id)).toEqual([ `b` ]);
  expect([ ...Dg.adjacentVertices(g, Dg.get(g, `b`)) ].map(v => v.id)).toEqual([ `c` ]);
  expect([ ...Dg.adjacentVertices(g, undefined) ]).toEqual([]);
  expect([ ...Dg.adjacentVertices(g, `d`) ]).toEqual([]);
  expect(() => [ ...Dg.adjacentVertices(g, `nope`) ]).toThrow();

  const a = Dg.get(g, `a`)!, b = Dg.get(g, `b`)!, c = Dg.get(g, `c`)!;
  expect(Dg.areAdjacent(g, a, b)).toBe(true);
  expect(Dg.areAdjacent(g, b, a)).toBe(true); // either direction
  expect(Dg.areAdjacent(g, a, c)).toBeUndefined();
});

test(`vertexHasOut-variants`, () => {
  const g = linearGraph();
  const a = Dg.get(g, `a`)!;
  expect(Dg.vertexHasOut(a, Dg.get(g, `b`)!)).toBe(true);
  // @ts-expect-error
  expect(Dg.vertexHasOut(undefined, `b`)).toBe(false);
});

test(`hasNoOuts-hasOut-variants`, () => {
  const g = linearGraph();
  expect(Dg.hasNoOuts(g, `unknown`)).toBe(false);
  expect(Dg.hasNoOuts(g, Dg.get(g, `d`)!)).toBe(true);
  expect(Dg.hasOut(g, Dg.get(g, `a`)!, Dg.get(g, `b`)!)).toBe(true);
  expect(() => Dg.hasOut(g, `unknown`, `a`)).toThrow();
  // @ts-expect-error
  expect(() => Dg.hasOut(g, undefined, `a`)).toThrow();
  expect(Dg.hasOnlyOuts(g, `d`)).toBe(true);
});

test(`iterators`, () => {
  const g = linearGraph();
  expect([ ...Dg.vertices(g) ].map(v => v.id)).toEqual([ `a`, `b`, `c`, `d` ]);
  expect([ ...Dg.edges(g) ].map(e => e.id)).toEqual([ `b`, `c`, `d` ]);
  expect([ ...Dg.edges(Dg.graph()) ]).toEqual([]);
});

test(`distanceDefault`, () => {
  const g = linearGraph();
  expect(Dg.distanceDefault(g, { id: `a`, weight: 4 })).toBe(4);
  expect(Dg.distanceDefault(g, { id: `a` })).toBe(1);
});

test(`clone-and-graphFromVertices`, () => {
  const g = linearGraph();
  const c = Dg.clone(g);
  expect(c).not.toBe(g);
  expect(Dg.dumpGraph(c)).toBe(Dg.dumpGraph(g));
  const f = Dg.graphFromVertices([ Dg.createVertex(`x`), { id: `y`, out: [ { id: `x` } ] } ]);
  expect(Dg.hasOut(f, `y`, `x`)).toBe(true);
});

test(`dumpGraph-weights-and-iterable`, () => {
  const g = Dg.graph({ from: `a`, to: `b`, weight: 3 });
  expect(Dg.dumpGraph(g)).toBe([ ` a`, `  -> b (3)`, ` b (terminal)` ].join(`\n`));
  expect(Dg.dumpGraph(Dg.vertices(g))).toBe(Dg.dumpGraph(g));
});

test(`graph-validation`, () => {
  // @ts-expect-error
  expect(() => Dg.hasKey(undefined, `a`)).toThrow(/undefined/);
  // @ts-expect-error
  expect(() => Dg.hasKey(null, `a`)).toThrow(/null/);
  // @ts-expect-error
  expect(() => Dg.hasKey({}, `a`)).toThrow(/vertices/);
  // @ts-expect-error
  expect(() => Dg.hasKey(5, `a`)).toThrow();
  expect(() => Dg.get(linearGraph(), ``)).toThrow();
});

test(`topologicalSort-orders-and-rejects-cycles`, () => {
  const g = Dg.graph(
    { from: `c`, to: `d` },
    { from: `a`, to: `b` },
    { from: `b`, to: `c` }
  );
  const sorted = [ ...Dg.vertices(Dg.topologicalSort(g)) ].map(v => v.id);
  expect(sorted).toEqual([ `a`, `b`, `c`, `d` ]);
  expect(() => Dg.topologicalSort(circularGraph())).toThrow(/cycles/);
});

test(`getCycles-self-loop-and-none`, () => {
  expect(Dg.getCycles(linearGraph())).toEqual([]);
  expect(Dg.getCycles(Dg.graph())).toEqual([]);
});

test(`toAdjacencyMatrix-labels`, () => {
  const m = Dg.toAdjacencyMatrix(linearGraph());
  expect(m.row(0)).toEqual([ false, true, false, false ]);
  expect(m.row(3)).toEqual([ false, false, false, false ]);
});

test(`transitiveReduction-no-redundancy`, () => {
  const g = linearGraph();
  expect(Dg.dumpGraph(Dg.transitiveReduction(g))).toBe(Dg.dumpGraph(g));
});

test(`pathDijkstra-detached-source-vertex`, () => {
  const g = linearGraph();
  const { distances } = Dg.pathDijkstra(g, { id: `q`, out: [ { id: `a`, weight: 2 } ] });
  expect(distances.get(`q`)).toBe(0);
  expect(distances.get(`a`)).toBe(2);
  expect(distances.get(`d`)).toBe(5);
});
