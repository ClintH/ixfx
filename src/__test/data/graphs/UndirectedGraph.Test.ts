import test from 'ava';
import * as G from '../../../data/graphs/UndirectedGraph.js';

test(`edgesForVertex`, t => {
  const g = G.graph(
    { a: `0`, b: [ `1`, `2`, `3` ] },
    { a: `2`, b: `1` }
  );

  const edges = [ ...G.edgesForVertex(g, `0`) ];
  t.deepEqual(edges, [
    { a: 0, b: 1 },
    { a: 0, b: 2 },
    { a: 0, b: 3 }
  ]);
});

test(`adjacent`, t => {
  const g = G.graph(
    { a: `0`, b: [ `1`, `2`, `3` ] },
    { a: `2`, b: `1` }
  );

  const r1 = [ ...G.adjacentVertices(g, `0`) ];
  t.deepEqual(r1, [
    { id: `1` }, { id: `2` }, { id: `3` }
  ]);

  const r2 = [ ...G.adjacentVertices(g, `1`) ];
  t.deepEqual(r2, [
    { id: `0` }, { id: `2` }
  ]);

  t.throws(() => {
    [ ...G.adjacentVertices(g, `5`) ]
  });
});


test(`toAdjacencyMatrix`, t => {
  const g = G.graph(
    { a: `0`, b: [ `1`, `2`, `3` ] },
    { a: `2`, b: `1` }
  );
  const m = G.toAdjacencyMatrix(g);


  t.deepEqual(m.rows[ 0 ], [ false, true, true, true ]);
  t.deepEqual(m.rows[ 1 ], [ true, false, true, false ]);
  t.deepEqual(m.rows[ 2 ], [ true, true, false, false ]);
  t.deepEqual(m.rows[ 3 ], [ true, false, false, false ]);
});