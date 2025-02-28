
import { applyToValues, round } from '../../numbers/index.js';
import * as Colour from '../../visual/colour/index.js';
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
  const hsl2a = Colour.toHsl(`white`);
  t.is(hsl2a.l, 1);

  t.throws(() => Colour.toHsl(`white`, false)); // disable safe

  t.is(Colour.toHex(`black`), `#000000`);
  const hsl3 = Colour.toHsl(`black`);
  t.is(hsl3.l, 0);

});

test(`colour-parse`, (t) => {
  // Indeterminate input
  //t.like(Colour.toHsl(`hsl(0,0%,0%)`), { h: 0, s: 0, l: 0 });
  //t.like(Colour.toHsl(`hsla(0,0%,0%,0)`), { h: 0, s: 0, l: 0 });

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

test(`rgb-validate`, t => {
  // Values exceed relative range
  t.throws(() => Colour.toString({ r: 255, g: 0, b: 0, unit: `relative` }));
  t.throws(() => Colour.toString({ r: 0, g: 2, b: 0, unit: `relative` }));
  t.throws(() => Colour.toString({ r: 0, g: 0, b: 2, unit: `relative` }));
  t.throws(() => Colour.toString({ r: 0, g: 0, b: 0, opacity: 10, unit: `relative` }));

  // Values exceed 8bit range
  t.throws(() => Colour.toString({ r: 256, g: 0, b: 0, unit: `8bit` }));
  t.throws(() => Colour.toString({ r: 0, g: -1, b: 0, unit: `8bit` }));
  t.throws(() => Colour.toString({ r: 0, g: 0, b: 300, unit: `8bit` }));
  t.throws(() => Colour.toString({ r: 0, g: 0, b: 0, opacity: 10, unit: `8bit` }));
});

test(`hsl-validate`, t => {
  // Values exceed relative range
  t.throws(() => Colour.toString({ h: 1.1, s: 0, l: 0, unit: `relative` }));
  t.throws(() => Colour.toString({ h: 0, s: 2, l: 0, unit: `relative` }));
  t.throws(() => Colour.toString({ h: 0, s: 0, l: 2, unit: `relative` }));
  t.throws(() => Colour.toString({ h: 0, s: 0, l: 0, opacity: 10, unit: `relative` }));

  // Values exceed absolute range
  t.notThrows(() => Colour.toString({ h: 361, s: 0, l: 0, unit: `absolute` })); // angles wrap
  t.throws(() => Colour.toString({ h: 0, s: -1, l: 0, unit: `absolute` }));
  t.throws(() => Colour.toString({ h: 0, s: 0, l: 200, unit: `absolute` }));
  t.throws(() => Colour.toString({ h: 0, s: 0, l: 0, opacity: 10, unit: `absolute` }));
});

test(`to-string`, t => {

  t.is(Colour.toString(`black`), `rgb(0% 0% 0%)`);
  t.is(Colour.toString({ r: 0, g: 0, b: 0, unit: `relative` }), `rgb(0% 0% 0%)`);
  t.is(Colour.toString({ r: 1, g: 1, b: 1, unit: `relative` }), `rgb(100% 100% 100%)`);
  t.is(Colour.toString({ r: 1, g: 1, b: 1, opacity: 0.5, unit: `relative` }), `rgb(100% 100% 100% / 0.5)`);

  t.is(Colour.toString({ r: 0, g: 0, b: 0, unit: `8bit` }), `rgb(0% 0% 0%)`);
  t.is(Colour.toString({ r: 255, g: 255, b: 255, unit: `8bit` }), `rgb(100% 100% 100%)`);
  t.is(Colour.toString({ r: 255, g: 255, b: 255, opacity: 0.5, unit: `8bit` }), `rgb(100% 100% 100% / 0.5)`);

  t.is(Colour.toString({ h: 0, s: 0, l: 0, unit: `relative` }), `hsl(0 0% 0%)`);
  t.is(Colour.toString({ h: 0, s: 0, l: 0, opacity: 0.5, unit: `relative` }), `hsl(0 0% 0% / 0.5)`);

  t.is(Colour.toString({ h: 200, s: 0, l: 0, unit: `absolute` }), `hsl(200 0% 0%)`);
  t.is(Colour.toString({ h: 200, s: 100, l: 100, opacity: 0.5, unit: `absolute` }), `hsl(200 100% 100% / 0.5)`);

});