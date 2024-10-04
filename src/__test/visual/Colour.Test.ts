
import { applyToValues, round } from '../../numbers/index.js';
import * as Colour from '../../visual/Colour.js';
import test from 'ava';
test(`opacity`, (t) => {
  t.is(Colour.multiplyOpacity(`red`, 0.5), `rgb(100% 0% 0% / 0.5)`);
  t.is(Colour.multiplyOpacity(`hsl(0,100%,50%)`, 0.5), `hsl(0 100% 50% / 0.5)`);
});

test(`special`, t => {
  t.is(Colour.toHex(`transparent`), `#00000000`);
  const hsl1 = Colour.toHsl(`transparent`);

  t.is(hsl1.opacity, 0);

  t.is(Colour.toHex(`white`), `#ffffff`);
  const hsl2 = Colour.toHsl(`white`);
  t.is(hsl2.l, 1);

  t.is(Colour.toHex(`black`), `#000000`);
  const hsl3 = Colour.toHsl(`black`);
  t.is(hsl3.l, 0);

});

test(`colour-parse`, (t) => {
  // Indeterminate input
  t.like(Colour.toHsl(`hsl(0,0%,0%)`), { h: 0, s: 0, l: 0 });
  t.like(Colour.toHsl(`hsla(0,0%,0%,0)`), { h: 0, s: 0, l: 0 });

  t.like(Colour.toHsl(`hsl(100, 100%, 50%)`), { h: 100 / 360, s: 1, l: 0.5 });

  t.like(Colour.toHsl(`red`), { h: 0, s: 1, l: 0.5 });
  t.like(Colour.toHsl(`rgb(255,0,0)`), { h: 0, s: 1, l: 0.5 });
  t.like(Colour.toHsl(`rgba(255,0,0, 1)`), { h: 0, s: 1, l: 0.5, opacity: 1.0 });
  t.like(Colour.toHsl(`rgba(255,0,0, 0.5)`), { h: 0, s: 1, l: 0.5, opacity: 0.5 });

  t.like(applyToValues(Colour.toHsl(`hotpink`), v => round(3, v)), { h: 0.916, s: 1, l: 0.705 });
  t.like(Colour.toHsl(`rgb(255,105,180)`), { h: 0.916666666666666666, s: 1, l: 0.7058823529411764 });
  t.like(Colour.toHsl(`rgba(255,105,180,0.5)`), { h: 0.9166666666666666, s: 1, l: 0.7058823529411764, opacity: 0.5 });

  t.like(Colour.toHsl(`hsla(100, 100%, 50%, 0.20)`), { h: 0.2777777777777778, s: 1, l: 0.5, opacity: 0.2 });

});