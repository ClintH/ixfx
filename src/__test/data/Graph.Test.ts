// import test from 'ava';
// import * as G from '../../data/Graph.js';
// test(`toAdjacencyMatrix`, t => {

//   const g = G.graph(
//     { a: `0`, b: [ `1`, `2`, `3` ] },
//     { from: `2`, to: `1` }
//   );
//   const m = Dg.toAdjacencyMatrix(g);

//   console.log(m);
//   t.deepEqual(m[ 0 ], [ false, true, true, true ]);
//   t.deepEqual(m[ 1 ], [ true, false, true, false ]);
//   t.deepEqual(m[ 2 ], [ true, true, false, false ]);
//   t.deepEqual(m[ 3 ], [ true, false, false, false ]);
// });