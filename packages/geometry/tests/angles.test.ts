import { test, expect } from 'vitest';
import { degreeToRadian, radianToDegree, degreeArc, degreesSum, radiansSum, angleParse, radianToTurn, turnToRadian, turnToDegree, degreeToTurn, degreeToGradian, gradianToDegree, gradianToRadian, angleConvert, radianToGradian } from '../src/angles.js';


test(`degreeArc`, () => {
  // From zero CW
  expect(degreeArc(0, 90, true)).toBe(270);
  expect(degreeArc(0, 180, true)).toBe(180);
  expect(degreeArc(0, 270, true)).toBe(90);
  expect(degreeArc(0, 360, true)).toBe(0);

  // From zero CCW
  expect(degreeArc(0, 90, false)).toBe(90);
  expect(degreeArc(0, 180, false)).toBe(180);
  expect(degreeArc(0, 270, false)).toBe(270);
  expect(degreeArc(0, 360, false)).toBe(0);

  // Cross over pre zero
  expect(degreeArc(45, 315, true)).toBe(90);
  expect(degreeArc(45, 225, true)).toBe(180);
  expect(degreeArc(45, 135, true)).toBe(270);
  expect(degreeArc(45, 45, true)).toBe(0);

  // Cross over post zero
  expect(degreeArc(315, 315, false)).toBe(0);
  expect(degreeArc(315, 225, false)).toBe(270);
  expect(degreeArc(315, 135, false)).toBe(180);
  expect(degreeArc(315, 45, false)).toBe(90);

});

test(`radiansSum`, () => {
  expect(radiansSum(3.14, 1.57, false)).toBe(1.57);


  // From zero CCW
  expect(degreesSum(0, 90, false)).toBe(270);
  expect(degreesSum(0, 180, false)).toBe(180);
  expect(degreesSum(0, 270, false)).toBe(90);
  expect(degreesSum(0, 360, false)).toBe(0);

  // From zero CW
  expect(degreesSum(0, 90, true)).toBe(90);
  expect(degreesSum(0, 180, true)).toBe(180);
  expect(degreesSum(0, 270, true)).toBe(270);
  expect(degreesSum(0, 360, true)).toBe(0);

  // Pre zero CCW
  expect(degreesSum(45, 45, false)).toBe(0);
  expect(degreesSum(45, 90, false)).toBe(315);
  expect(degreesSum(45, 180, false)).toBe(225);
  expect(degreesSum(45, 270, false)).toBe(135);
  expect(degreesSum(45, 360, false)).toBe(45);

  // Post zero CW
  expect(degreesSum(315, 45, true)).toBe(0);
  expect(degreesSum(315, 90, true)).toBe(45);
  expect(Math.ceil(degreesSum(315, 180, true))).toBe(135);
  expect(Math.floor(degreesSum(315, 270, true))).toBe(225);
  expect(Math.ceil(degreesSum(315, 360, true))).toBe(315);


});

test(`degree-to-radian`, () => {
  expect(degreeToRadian(30).toPrecision(4)).toBe('0.5236');
  expect(degreeToRadian(45).toPrecision(4)).toBe('0.7854');
  expect(degreeToRadian(60).toPrecision(4)).toBe('1.047');
  expect(degreeToRadian(90).toPrecision(4)).toBe('1.571');
  expect(degreeToRadian(120).toPrecision(4)).toBe('2.094');
  expect(degreeToRadian(135).toPrecision(4)).toBe('2.356');
  expect(degreeToRadian(150).toPrecision(4)).toBe('2.618');
  expect(degreeToRadian(180).toPrecision(4)).toBe('3.142');
  expect(degreeToRadian(200).toPrecision(4)).toBe('3.491');
  expect(degreeToRadian(270).toPrecision(4)).toBe('4.712');
  expect(degreeToRadian(360).toPrecision(4)).toBe('6.283');
});

test(`radian-to-degree`, () => {
  expect(radianToDegree(0)).toBe(0);
  expect(Math.round(radianToDegree(0.5235))).toBe(30);
  expect(Math.round(radianToDegree(0.7853))).toBe(45);
  expect(Math.round(radianToDegree(1.047))).toBe(60);
  expect(Math.round(radianToDegree(1.5707))).toBe(90);
  expect(Math.round(radianToDegree(2.0943))).toBe(120);
  expect(Math.round(radianToDegree(3.1415))).toBe(180);
  expect(Math.round(radianToDegree(4.7123))).toBe(270);
  expect(Math.round(radianToDegree(6.2831))).toBe(360);
});

test(`radian-to-turn`, () => {
  // https://www.unitconverters.net/angle/radian-to-turn.htm
  expect(radianToTurn(1)).toEqual(0.15915494309189535);
  expect(radianToTurn(0.01)).toEqual(0.0015915494309189536);
});

test(`degree-to-turn`, () => {
  expect(degreeToTurn(1)).toEqual(0.002777777777777778);
  expect(degreeToTurn(360)).toEqual(1);
  expect(degreeToTurn(540)).toEqual(1.5);

});

test(`turn-to-radian`, () => {
  expect(turnToRadian(1)).toEqual(6.283185307179586);
  expect(turnToRadian(10)).toEqual(62.83185307179586);
});

test(`turn-to-degree`, () => {
  expect(turnToDegree(1, true)).toEqual(0);
  expect(turnToDegree(1, false)).toEqual(360);
  expect(turnToDegree(1.5, true)).toEqual(180);
  expect(turnToDegree(1.5, false)).toEqual(540);
});

test(`degree-to-gradian`, () => {
  expect(degreeToGradian(0)).toEqual(0);
  expect(Math.ceil(degreeToGradian(90))).toEqual(100);
  expect(Math.ceil(degreeToGradian(360))).toEqual(400);
  expect(Math.ceil(degreeToGradian(720))).toEqual(800);
});

test(`gradian-to-degree`, () => {
  expect(gradianToDegree(800, true)).toEqual(0);
  expect(gradianToDegree(800, false)).toEqual(720);
  expect(gradianToDegree(0, false)).toEqual(0);
  expect(gradianToDegree(100, false)).toEqual(90);
  expect(gradianToDegree(400, false)).toEqual(360);
  expect(gradianToDegree(400, true)).toEqual(0);
});

test(`gradian-to-radian`, () => {
  expect(gradianToRadian(10)).toEqual(0.157079633);
  expect(gradianToRadian(400)).toEqual(6.283185319999999);

})

test(`angle-parse`, () => {
  expect(angleParse(`100`)).toEqual({ value: 100, unit: `deg` });
  expect(angleParse(100)).toEqual({ value: 100, unit: `deg` });
  expect(angleParse(`100deg`)).toEqual({ value: 100, unit: `deg` });
  expect(angleParse(`10rad`)).toEqual({ value: 10, unit: `rad` });
  expect(angleParse(`1turn`)).toEqual({ value: 1, unit: `turn` });
  expect(angleParse(`20grad`)).toEqual({ value: 20, unit: `grad` });

  expect(() => angleParse(`asf`)).toThrow();
  expect(() => angleParse(``)).toThrow();
  expect(() => angleParse(false as any as string)).toThrow();
  expect(() => angleParse({ blorp: true } as any as string)).toThrow();
});

test(`angle-convert`, () => {
  expect(angleConvert(100, `deg`)).toEqual({ value: 100, unit: `deg` });
  expect(angleConvert(100, `rad`)).toEqual({ value: degreeToRadian(100), unit: `rad` });
  expect(angleConvert(100, `turn`)).toEqual({ value: degreeToTurn(100), unit: `turn` });
  expect(angleConvert(100, `grad`)).toEqual({ value: degreeToGradian(100), unit: `grad` });

  expect(angleConvert(`4rad`, `deg`)).toEqual({ value: radianToDegree(4), unit: `deg` });
  expect(angleConvert(`4rad`, `rad`)).toEqual({ value: 4, unit: `rad` });
  expect(angleConvert(`4rad`, `turn`)).toEqual({ value: radianToTurn(4), unit: `turn` });
  expect(angleConvert(`4rad`, `grad`)).toEqual({ value: radianToGradian(4), unit: `grad` });

  expect(() => angleConvert(100, `blorp` as any as `deg`)).toThrow();
})