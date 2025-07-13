import { test, expect, assert } from 'vitest';
import * as Dg from '../../src/graph/directed-graph.js';

const linearGraph = () => {
  return Dg.graph(
    { from: `a`, to: `b` },
    { from: `b`, to: `c` },
    { from: `c`, to: `d` }
  )
};

const circularGraph = () => {
  return Dg.graph(
    { from: `a`, to: `b` },
    { from: `b`, to: `c` },
    { from: `c`, to: `d` },
    { from: `d`, to: `a` }
  )
}

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

// FIXME

// test(`pathDijkstra`, () => {
//   const g = Dg.graph(
//     { from: `1`, to: `6`, weight: 14 },
//     { from: `1`, to: `3`, weight: 9 },
//     { from: `1`, to: `2`, weight: 7 },

//     { from: `6`, to: `5`, weight: 9 },
//     { from: `6`, to: `3`, weight: 2 },

//     { from: `2`, to: `3`, weight: 10 },
//     { from: `2`, to: `4`, weight: 15 },

//     { from: `4`, to: `5`, weight: 6 },

//     { from: `5`, to: `7`, weight: 6 }
//   );
//   console.log(`graph made`);
//   const { distances, previous, pathTo } = Dg.pathDijkstra(g, `1`);
//   console.log(`path`);

//   expect(distances.get(`1`)).eq(0);
//   expect(distances.get(`6`)).eq(14);
//   expect(distances.get(`3`)).eq(9);
//   expect(distances.get(`2`)).eq(7);
//   expect(distances.get(`5`)).eq(23);
//   expect(distances.get(`4`)).eq(22);

//   expect(previous.get(`5`)?.id).eq(`6`);
//   expect(previous.get(`2`)?.id).eq(`1`);

//   // console.log(distances);
//   // console.log(previous);
//   // console.log(`---`);
//   // console.log(pathTo(`7`));
// });