import test from 'ava';
import { applyBounds } from '../../../geometry/grid/ApplyBounds.js';
import type { GridBoundsLogic } from '../../../geometry/grid/Types.js';

test(`apply-bounds`, t => {
  const logics: GridBoundsLogic[] = [ `stop`, `undefined`, `unbounded`, 'wrap' ];
  const g = { rows: 3, cols: 3 };
  const r1 = logics.map(logic => applyBounds(g, { x: 0, y: 0 }, logic));
  t.deepEqual(r1, [ { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 } ]);

  const r2 = logics.map(logic => applyBounds(g, { x: -1, y: 0 }, logic));
  t.deepEqual(r2, [ { x: 0, y: 0 }, undefined, { x: -1, y: 0 }, { x: 2, y: 0 } ]);

  const r3 = logics.map(logic => applyBounds(g, { x: 2, y: 2 }, logic));
  t.deepEqual(r3, [ { x: 2, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 2 } ]);

  const r4 = logics.map(logic => applyBounds(g, { x: 2, y: 3 }, logic));
  t.deepEqual(r4, [ { x: 2, y: 2 }, undefined, { x: 2, y: 3 }, { x: 2, y: 0 } ]);

  const r5 = logics.map(logic => applyBounds(g, { x: 3, y: 3 }, logic));
  t.deepEqual(r5, [ { x: 2, y: 2 }, undefined, { x: 3, y: 3 }, { x: 0, y: 0 } ]);

})