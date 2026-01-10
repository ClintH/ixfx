/* eslint-disable @typescript-eslint/ban-ts-comment */
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

  const edges2 = [ ...G.edgesForVertex(g, `1`) ];
  expect(edges2).toEqual(
    [
      { "a": "0", "b": "1", "weight": undefined, },
      { "a": "2", "b": "1", "weight": undefined, }
    ]
  );

  // Not found
  expect(() => { return [ ...G.edgesForVertex(g, `100`) ] }).toThrow();
  // @ts-expect-error
  expect(() => { return [ ...G.edgesForVertex(false, `100`) ] }).toThrow();

  // @ts-expect-error
  expect(() => G.getConnection(false, '', '')).toThrow();

  // @ts-expect-error
  expect(() => G.getConnection(g, undefined, undefined)).toThrow();
  // @ts-expect-error
  expect(() => G.getConnection(g, { id: 'a' }, undefined)).toThrow();
  // @ts-expect-error
  expect(() => G.getConnection(g, undefined, { id: 'a' })).toThrow();

  expect([ ...G.edgesForVertex(g, undefined) ]).toStrictEqual([]);
});

test(`dump`, () => {
  const g = G.graph(
    { a: `0`, b: [ `1`, `2`, `3` ] },
    { a: `2`, b: `1` }
  );
  expect(G.dumpGraph(g)).toBe(`Vertices: 0, 1, 2, 3
Edges:
0 <-> 1
0 <-> 2
0 <-> 3
2 <-> 1`);
});

test(`adjacent`, () => {
  const g = G.graph(
    { a: `0`, b: [ `1`, `2`, `3` ] },
    { a: `2`, b: `1` }
  );
  expect([ ...G.adjacentVertices(g, undefined) ]).toStrictEqual([]);

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

