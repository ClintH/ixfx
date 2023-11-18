import test from 'ava';

import * as Rects from '../../geometry/rect/index.js';

test(`cardinal`, t => {

  const r = {
    x: 10,
    y: 20,
    width: 50,
    height: 200
  };

  t.like(Rects.cardinal(r, `nw`), {
    x: 10,
    y: 20
  });
  t.like(Rects.cardinal(r, `ne`), {
    x: 60,
    y: 20
  });
  t.like(Rects.cardinal(r, `n`), {
    x: 35,
    y: 20
  });
  t.like(Rects.cardinal(r, `center`), {
    x: 35,
    y: 120
  });
  t.like(Rects.cardinal(r, `w`), {
    x: 10,
    y: 120
  });
  t.like(Rects.cardinal(r, `e`), {
    x: 60,
    y: 120
  });
  t.like(Rects.cardinal(r, `s`), {
    x: 35,
    y: 220
  });
  t.like(Rects.cardinal(r, `sw`), {
    x: 10,
    y: 220
  });
  t.like(Rects.cardinal(r, `se`), {
    x: 60,
    y: 220
  });

  t.pass();
});