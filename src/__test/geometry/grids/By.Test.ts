import test from 'ava';
import * as Grids from '../../../geometry/grid/index.js';
import { By } from '../../../geometry/grid/index.js';

test(`cells`, (t) => {
  const g = { rows: 3, cols: 3 };

  // Starting from 0,0
  const e1 = [
    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
    { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 },
    { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }
  ];

  const r1 = [ ...By.cells(g, { x: 0, y: 0 }, true) ];
  t.deepEqual(r1, e1);

  // Starting from middle
  const e2 = [
    { x: 1, y: 1 }, { x: 2, y: 1 },
    { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 },
    { x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 },
    { x: 0, y: 1 }
  ];
  const r2 = [ ...By.cells(g, { x: 1, y: 1 }, true) ];
  t.deepEqual(r2, e2);

  // Starting from end
  const e3 = [
    { x: 2, y: 2 },
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 0, y: 2 },
    { x: 1, y: 2 }
  ];
  const r3 = [ ...By.cells(g, { x: 2, y: 2 }, true) ];
  t.deepEqual(r3, e3);
});

test(`cell-no-wrap`, t => {
  const g = { rows: 3, cols: 3 };

  // Starting from top
  const e1 = [
    { x: 0, y: 0 },
    { x: 1, y: 0 },
    { x: 2, y: 0 },
    { x: 0, y: 1 },
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 0, y: 2 },
    { x: 1, y: 2 },
    { x: 2, y: 2 }
  ];
  const r1 = [ ...By.cells(g, { x: 0, y: 0 }, false) ];
  t.deepEqual(r1, e1);

  // From end
  const e2 = [ { x: 2, y: 2 } ];
  const r2 = [ ...By.cells(g, { x: 2, y: 2 }, false) ];
  t.deepEqual(r2, e2);

  // From middle
  const e3 = [
    { x: 1, y: 1 },
    { x: 2, y: 1 },
    { x: 0, y: 2 },
    { x: 1, y: 2 },
    { x: 2, y: 2 }
  ]
  const r3 = [ ...By.cells(g, { x: 1, y: 1 }, false) ];
  t.deepEqual(r3, e3);
});



