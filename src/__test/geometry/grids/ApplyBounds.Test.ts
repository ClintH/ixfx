import expect from 'expect';
import { applyBounds } from '../../../geometry/grid/ApplyBounds.js';
import type { GridBoundsLogic } from '../../../geometry/grid/Types.js';

test(`apply-bounds`, () => {
  const logics: GridBoundsLogic[] = [ `stop`, `undefined`, `unbounded`, 'wrap' ];
  const g = { rows: 3, cols: 3 };
  const r1 = logics.map(logic => applyBounds(g, { x: 0, y: 0 }, logic));
  expect(r1).toEqual([ { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 }, { x: 0, y: 0 } ]);

  const r2 = logics.map(logic => applyBounds(g, { x: -1, y: 0 }, logic));
  expect(r2).toEqual([ { x: 0, y: 0 }, undefined, { x: -1, y: 0 }, { x: 2, y: 0 } ]);

  const r3 = logics.map(logic => applyBounds(g, { x: 2, y: 2 }, logic));
  expect(r3).toEqual([ { x: 2, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 2 }, { x: 2, y: 2 } ]);

  const r4 = logics.map(logic => applyBounds(g, { x: 2, y: 3 }, logic));
  expect(r4).toEqual([ { x: 2, y: 2 }, undefined, { x: 2, y: 3 }, { x: 2, y: 0 } ]);

  const r5 = logics.map(logic => applyBounds(g, { x: 3, y: 3 }, logic));
  expect(r5).toEqual([ { x: 2, y: 2 }, undefined, { x: 3, y: 3 }, { x: 0, y: 0 } ]);

})