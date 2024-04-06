
import { applyToValues, round } from '../../numbers/index.js';
import * as Colour from '../../visual/Colour.js';
import test from 'ava';
test(`opacity`, (t) => {
  t.is(Colour.opacity(`red`, 0.5), `rgba(255, 0, 0, 0.5)`);
  t.is(Colour.opacity(`hsl(0,100%,50%)`, 0.5), `rgba(255, 0, 0, 0.5)`);
});

test(`colour-parse`, (t) => {
  // Indeterminate input
  t.like(Colour.toHsl(`hsl(0,0%,0%)`), { h: Number.NaN, s: Number.NaN, l: 0 });
  t.like(Colour.toHsl(`hsla(0,0%,0%,0)`), { h: Number.NaN, s: Number.NaN, l: Number.NaN });

  t.like(Colour.toHsl(`hsl(100, 100%, 50%)`), { h: 100, s: 1, l: 0.5 });

  t.like(Colour.toHsl(`red`), { h: 0, s: 1, l: 0.5 });
  t.like(Colour.toHsl(`rgb(255,0,0)`), { h: 0, s: 1, l: 0.5 });
  t.like(Colour.toHsl(`rgba(255,0,0, 1)`), { h: 0, s: 1, l: 0.5, opacity: 1.0 });
  t.like(Colour.toHsl(`rgba(255,0,0, 0.5)`), { h: 0, s: 1, l: 0.5, opacity: 0.5 });

  t.like(applyToValues(Colour.toHsl(`hotpink`), v => round(3, v)), { h: 330, s: 1, l: 0.705 });
  t.like(Colour.toHsl(`rgb(255,105,180)`), { h: 330, s: 1, l: 0.7058823529411764 });
  t.like(Colour.toHsl(`rgba(255,105,180,0.5)`), { h: 330, s: 1, l: 0.7058823529411764, opacity: 0.5 });

  t.like(Colour.toHsl(`hsla(100, 100%, 50%, 0.20)`), { h: 100, s: 1, l: 0.5, opacity: 0.2 });

  t.throws(() => Colour.toHsl(`hsla(100 100% 50% 20%)`));
  t.throws(() => Colour.toHsl(`hsla(100, 1, .5, .2)`));
});