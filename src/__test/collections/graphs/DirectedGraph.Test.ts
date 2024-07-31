import test from 'ava';
import * as Dg from '../../../collections/graphs/DirectedGraph.js';
import { arrayValuesEqual } from '../../Include.js';
import { hasEqualValuesShallow } from '../../../iterables/CompareValues.js';

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

test(`errors`, t => {
  // @ts-expect-error
  let g = t.throws(() => Dg.graph(undefined));
  // @ts-expect-error
  g = t.throws(() => Dg.graph(null));

  // @ts-expect-error
  const g = t.throws(() => Dg.graph(10));
  // @ts-expect-error
  const g = t.throws(() => Dg.graph("blah"));

})

test(`toAdjacencyMatrix`, t => {
  // Directed
  const g = Dg.graph(
    { from: `0`, to: [ `1`, `2`, `3` ] },
    { from: `2`, to: `1` }
  );
  const m = Dg.toAdjacencyMatrix(g);
  t.deepEqual(m.row(0), [ false, true, true, true ]);
  t.deepEqual(m.row(1), [ false, false, false, false ]);
  t.deepEqual(m.row(2), [ false, true, false, false ]);
  t.deepEqual(m.row(3), [ false, false, false, false ]);
});

test(`topologicalSort`, t => {
  // Case 1: https://mohammad-imran.medium.com/understanding-topological-sorting-with-kahns-algo-8af5a588dd0e
  const g = Dg.graph(
    { from: `a`, to: [ `d`, `b` ] },
    { from: `b`, to: [ `d`, `c` ] }
  );
  const s1 = Dg.topologicalSort(g);
  t.true(Dg.hasOut(s1, `a`, `d`));
  t.true(Dg.hasOut(s1, `a`, `b`));
  t.true(Dg.hasOut(s1, `b`, `d`));
  t.true(Dg.hasOut(s1, `b`, `c`));
  t.true(Dg.hasNoOuts(s1, `d`));
  t.true(Dg.hasNoOuts(s1, `c`));
});

test(`isAcyclic`, t => {
  // Graph from: https://en.wikipedia.org/wiki/Directed_acyclic_graph
  const g = Dg.graph(
    { from: `a`, to: [ `b`, `c`, `d`, `e` ] },
    { from: `b`, to: `d` },
    { from: `c`, to: [ `d`, `e` ] },
    { from: `d`, to: `e` }
  );

  // True, no loops
  t.is(Dg.isAcyclic(g), true);

  // True: straight line
  t.is(Dg.isAcyclic(linearGraph()), true);

  // False: loops
  t.is(Dg.isAcyclic(circularGraph()), false);

});

test(`bfs`, t => {
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
  t.is(order, `1 2 3 4 5 6 7 8 9 10 11 12`);
});

test(`transitiveReduction`, t => {
  // In this case, the edge A->B is redundant, because B depends on C.
  const g1 = Dg.graph(
    { from: `a`, to: [ `b`, `c`, `d` ] },
    { from: `c`, to: `b` },
    { from: `d`, to: `e` },
    { from: `e`, to: `b` }
  );
  const r1 = Dg.transitiveReduction(g1);

  t.true(Dg.hasOnlyOuts(r1, `a`, `d`, `c`));
  t.true(Dg.hasNoOuts(r1, `b`));
  t.true(Dg.hasOnlyOuts(r1, `c`, `b`));
  t.true(Dg.hasOnlyOuts(r1, `d`, `e`));
  t.true(Dg.hasOnlyOuts(r1, `e`, `b`));

  // Case 2 https://en.wikipedia.org/wiki/Transitive_reduction
  const g2 = Dg.graph(
    { from: `a`, to: [ `b`, `c`, `e` ] },
    { from: `b`, to: `d` },
    { from: `c`, to: [ `d`, `e` ] },
    { from: `d`, to: `e` }
  );
  const r2 = Dg.transitiveReduction(g2);
  t.true(Dg.hasOnlyOuts(r2, `a`, `b`, `c`))
  t.true(Dg.hasOnlyOuts(r2, `b`, `d`))
  t.true(Dg.hasOnlyOuts(r2, `c`, `d`))
  t.true(Dg.hasOnlyOuts(r2, `d`, `e`))
  t.true(Dg.hasNoOuts(r2, `e`));
});

test(`cycles`, t => {
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
    return set.map(s => s.id);
  });

  arrayValuesEqual(t, setsToIds, [
    [ `g`, `f` ],
    [ `a`, `b`, `e` ],
    [ `c`, `d`, `h` ]
  ], hasEqualValuesShallow);
});

test(`connect`, t => {
  const g = Dg.graph(
    { from: `a`, to: `b` },
    { from: `a`, to: `c` }
  );

  t.true(Dg.hasOut(g, `a`, `b`));
  t.true(Dg.hasOut(g, `a`, `c`));
});

test(`dfs`, t => {
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
  t.is(path.length, 7);
});

test(`pathDijkstra`, t => {
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

  t.is(distances.get(`1`), 0);
  t.is(distances.get(`6`), 14);
  t.is(distances.get(`3`), 9);
  t.is(distances.get(`2`), 7);
  t.is(distances.get(`5`), 23);
  t.is(distances.get(`4`), 22);

  t.is(previous.get(`5`)?.id, `6`);
  t.is(previous.get(`2`)?.id, `1`);

  // console.log(distances);
  // console.log(previous);
  // console.log(`---`);
  // console.log(pathTo(`7`));
});