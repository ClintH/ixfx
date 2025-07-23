import { expect, test } from 'vitest';
import * as G from '../../src/graph/undirected-graph.js';

test(`edgesForVertex`, () => {
  const g = G.graph(
    { a: `0`, b: [ `1`, `2`, `3` ] },
    { a: `2`, b: `1` }
  );

  const edges = [ ...G.edgesForVertex(g, `0`) ];
  expect(edges).toEqual([
    { a: `0`, b: `1`, weight: undefined },
    { a: `0`, b: `2`, weight: undefined },
    { a: `0`, b: `3`, weight: undefined }
  ]);
});

test(`adjacent`, () => {
  const g = G.graph(
    { a: `0`, b: [ `1`, `2`, `3` ] },
    { a: `2`, b: `1` }
  );

  const r1 = [ ...G.adjacentVertices(g, `0`) ];
  expect(r1).toEqual([
    { id: `1` }, { id: `2` }, { id: `3` }
  ]);

  const r2 = [ ...G.adjacentVertices(g, `1`) ];
  expect(r2).toEqual([
    { id: `0` }, { id: `2` }
  ]);

  expect(() => [ ...G.adjacentVertices(g, `5`) ]).toThrow();
});


test(`toAdjacencyMatrix`, () => {
  const g = G.graph(
    { a: `0`, b: [ `1`, `2`, `3` ] },
    { a: `2`, b: `1` }
  );
  const m = G.toAdjacencyMatrix(g);
  expect(m.rows[ 0 ]).toEqual([ false, true, true, true ]);
  expect(m.rows[ 1 ]).toEqual([ true, false, true, false ]);
  expect(m.rows[ 2 ]).toEqual([ true, true, false, false ]);
  expect(m.rows[ 3 ]).toEqual([ true, false, false, false ]);
});