
import expect from 'expect';
import { applyToValues, round } from '../../numbers/index.js';
import * as Colour from '../../visual/colour/index.js';
test(`opacity`, () => {
  expect(Colour.multiplyOpacity(`red`, 0.5)).toBe(`rgb(100% 0% 0% / 0.5)`);
  expect(Colour.multiplyOpacity(`hsl(0,100%,50%)`, 0.5)).toBe(`hsl(0 100% 50% / 0.5)`);
});

test(`special`, () => {
  expect(Colour.toHex(`transparent`)).toBe(`#00000000`);
  const hsl1 = Colour.toHsl(`transparent`);

  expect(hsl1.opacity).toBe(0);

  expect(Colour.toHex(`white`)).toBe(`#ffffff`);
  const hsl2a = Colour.toHsl(`white`);
  expect(hsl2a.l).toBe(1);

  expect(() => Colour.toHsl(`white`, false)).toThrow(); // disable safe

  expect(Colour.toHex(`black`)).toBe(`#000000`);
  const hsl3 = Colour.toHsl(`black`);
  expect(hsl3.l).toBe(0);

});

test(`colour-parse`, () => {
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

test(`rgb-validate`, () => {
  // Values exceed relative range
  expect(() => Colour.toString({ r: 255, g: 0, b: 0, unit: `relative` })).toThrow();
  expect(() => Colour.toString({ r: 0, g: 2, b: 0, unit: `relative` })).toThrow();
  expect(() => Colour.toString({ r: 0, g: 0, b: 2, unit: `relative` })).toThrow();
  expect(() => Colour.toString({ r: 0, g: 0, b: 0, opacity: 10, unit: `relative` })).toThrow();

  // Values exceed 8bit range
  expect(() => Colour.toString({ r: 256, g: 0, b: 0, unit: `8bit` })).toThrow();
  expect(() => Colour.toString({ r: 0, g: -1, b: 0, unit: `8bit` })).toThrow();
  expect(() => Colour.toString({ r: 0, g: 0, b: 300, unit: `8bit` })).toThrow();
  expect(() => Colour.toString({ r: 0, g: 0, b: 0, opacity: 10, unit: `8bit` })).toThrow();
});

test(`hsl-validate`, () => {
  // Values exceed relative range
  expect(() => Colour.toString({ h: 1.1, s: 0, l: 0, unit: `relative` })).toThrow();
  expect(() => Colour.toString({ h: 0, s: 2, l: 0, unit: `relative` })).toThrow();
  expect(() => Colour.toString({ h: 0, s: 0, l: 2, unit: `relative` })).toThrow();
  expect(() => Colour.toString({ h: 0, s: 0, l: 0, opacity: 10, unit: `relative` })).toThrow();

  // Values exceed absolute range
  expect(() => Colour.toString({ h: 361, s: 0, l: 0, unit: `absolute` })).not.toThrow(); // angles wrap
  expect(() => Colour.toString({ h: 0, s: -1, l: 0, unit: `absolute` })).toThrow();
  expect(() => Colour.toString({ h: 0, s: 0, l: 200, unit: `absolute` })).toThrow();
  expect(() => Colour.toString({ h: 0, s: 0, l: 0, opacity: 10, unit: `absolute` })).toThrow();
});

test(`to-string`, () => {

  expect(Colour.toString(`black`)).toBe(`rgb(0% 0% 0%)`);
  expect(Colour.toString({ r: 0, g: 0, b: 0, unit: `relative` })).toBe(`rgb(0% 0% 0%)`);
  expect(Colour.toString({ r: 1, g: 1, b: 1, unit: `relative` })).toBe(`rgb(100% 100% 100%)`);
  expect(Colour.toString({ r: 1, g: 1, b: 1, opacity: 0.5, unit: `relative` })).toBe(`rgb(100% 100% 100% / 0.5)`);

  expect(Colour.toString({ r: 0, g: 0, b: 0, unit: `8bit` })).toBe(`rgb(0% 0% 0%)`);
  expect(Colour.toString({ r: 255, g: 255, b: 255, unit: `8bit` })).toBe(`rgb(100% 100% 100%)`);
  expect(Colour.toString({ r: 255, g: 255, b: 255, opacity: 0.5, unit: `8bit` })).toBe(`rgb(100% 100% 100% / 0.5)`);

  expect(Colour.toString({ h: 0, s: 0, l: 0, unit: `relative` })).toBe(`hsl(0 0% 0%)`);
  expect(Colour.toString({ h: 0, s: 0, l: 0, opacity: 0.5, unit: `relative` })).toBe(`hsl(0 0% 0% / 0.5)`);

  expect(Colour.toString({ h: 200, s: 0, l: 0, unit: `absolute` })).toBe(`hsl(200 0% 0%)`);
  expect(
    Colour.toString({ h: 200, s: 100, l: 100, opacity: 0.5, unit: `absolute` })
  ).toBe(`hsl(200 100% 100% / 0.5)`);

});