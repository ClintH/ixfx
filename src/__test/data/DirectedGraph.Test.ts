import test from 'ava';
import * as Dag from '../../data/DirectedGraph.js';

test(`findCycles`, t => {
  const g = new Dag.Graph();
  g.connect({ from: `a`, to: `b`, bidi: false, throwIfMissing: false });
  g.connect({ from: `a`, to: `c`, bidi: false, throwIfMissing: false });
  g.connect({ from: `b`, to: `c`, bidi: false, throwIfMissing: false });
  g.connect({ from: `c`, to: `d`, bidi: false, throwIfMissing: false });
  g.connect({ from: `d`, to: `e`, bidi: false, throwIfMissing: false });
  g.connect({ from: `e`, to: `b`, bidi: false, throwIfMissing: false });

  Dag.findCycles(g);

});

test(`connect`, t => {
  const g = new Dag.Graph();

  g.connect({ from: `a`, to: `b`, throwIfMissing: false });
  g.connect({ from: `a`, to: `c`, throwIfMissing: false });

  t.true(g.hasOut(`a`, `b`));
  t.true(g.hasOut(`a`, `c`));

  console.log(g.dump().join(`\n`));
  t.true(g.hasIn(`b`, `a`));
  t.true(g.hasIn(`c`, `a`));

});

test(`dfs`, t => {
  const g = new Dag.Graph();
  g.connect({ from: `1`, to: `6`, weight: 14, throwIfMissing: false });
  g.connect({ from: `1`, to: `3`, weight: 9, throwIfMissing: false });
  g.connect({ from: `1`, to: `2`, weight: 7, throwIfMissing: false });

  g.connect({ from: `6`, to: `5`, weight: 9, throwIfMissing: false });
  g.connect({ from: `6`, to: `3`, weight: 2, throwIfMissing: false });

  g.connect({ from: `2`, to: `3`, weight: 10, throwIfMissing: false });
  g.connect({ from: `2`, to: `4`, weight: 15, throwIfMissing: false });

  g.connect({ from: `4`, to: `5`, weight: 6, throwIfMissing: false });

  g.connect({ from: `5`, to: `7`, weight: 6, throwIfMissing: false });

  const path = [ ...Dag.dfs(g, `1`) ];
  t.is(path.length, 7);

  // for (const v of Dag.dfs(g, `1`)) {
  //   console.log(v.id);
  // }
});

test(`dijkstraPath`, t => {
  const g = new Dag.Graph();
  g.connect({ from: `1`, to: `6`, weight: 14, throwIfMissing: false });
  g.connect({ from: `1`, to: `3`, weight: 9, throwIfMissing: false });
  g.connect({ from: `1`, to: `2`, weight: 7, throwIfMissing: false });

  g.connect({ from: `6`, to: `5`, weight: 9, throwIfMissing: false });
  g.connect({ from: `6`, to: `3`, weight: 2, throwIfMissing: false });

  g.connect({ from: `2`, to: `3`, weight: 10, throwIfMissing: false });
  g.connect({ from: `2`, to: `4`, weight: 15, throwIfMissing: false });

  g.connect({ from: `4`, to: `5`, weight: 6, throwIfMissing: false });

  g.connect({ from: `5`, to: `7`, weight: 6, throwIfMissing: false });

  const { distances, previous, pathTo } = Dag.dijkstraPath(g, g.getOrCreate(`1`));

  t.is(distances.get(`1`), 0);
  t.is(distances.get(`6`), 14);
  t.is(distances.get(`3`), 9);
  t.is(distances.get(`2`), 7);
  t.is(distances.get(`5`), 23);
  t.is(distances.get(`4`), 22);

  t.is(previous.get(`5`)?.id, `6`);
  t.is(previous.get(`2`)?.id, `1`);

  console.log(distances);
  console.log(previous);
  console.log(`---`);
  console.log(pathTo(`7`));
});