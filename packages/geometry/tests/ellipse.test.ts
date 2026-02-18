import { test, expect, describe } from 'vitest';
import { fromDegrees, type Ellipse, type EllipsePositioned } from '../src/ellipse.js';
import { degreeToRadian } from '../src/angles.js';

describe(`ellipse`, () => {
  describe(`fromDegrees`, () => {
    test(`creates ellipse with given radii`, () => {
      const ellipse = fromDegrees(10, 20);
      expect(ellipse.radiusX).toBe(10);
      expect(ellipse.radiusY).toBe(20);
    });

    test(`converts rotation to radians`, () => {
      const ellipse = fromDegrees(5, 10, 90);
      expect(ellipse.rotation).toBeCloseTo(degreeToRadian(90));
    });

    test(`default rotation is 0`, () => {
      const ellipse = fromDegrees(5, 10);
      expect(ellipse.rotation).toBe(0);
    });

    test(`converts start angle to radians`, () => {
      const ellipse = fromDegrees(5, 10, 0, 45);
      expect(ellipse.startAngle).toBeCloseTo(degreeToRadian(45));
    });

    test(`default start angle is 0`, () => {
      const ellipse = fromDegrees(5, 10);
      expect(ellipse.startAngle).toBe(0);
    });

    test(`converts end angle to radians`, () => {
      const ellipse = fromDegrees(5, 10, 0, 0, 180);
      expect(ellipse.endAngle).toBeCloseTo(degreeToRadian(180));
    });

    test(`default end angle is 360`, () => {
      const ellipse = fromDegrees(5, 10);
      expect(ellipse.endAngle).toBeCloseTo(degreeToRadian(360));
    });

    test(`full ellipse with all parameters`, () => {
      const ellipse = fromDegrees(15, 25, 45, 90, 270);
      expect(ellipse.radiusX).toBe(15);
      expect(ellipse.radiusY).toBe(25);
      expect(ellipse.rotation).toBeCloseTo(degreeToRadian(45));
      expect(ellipse.startAngle).toBeCloseTo(degreeToRadian(90));
      expect(ellipse.endAngle).toBeCloseTo(degreeToRadian(270));
    });

    test(`partial arc ellipse`, () => {
      const ellipse = fromDegrees(10, 10, 0, 0, 90);
      expect(ellipse.startAngle).toBeCloseTo(0);
      expect(ellipse.endAngle).toBeCloseTo(degreeToRadian(90));
    });
  });

  describe(`Ellipse type`, () => {
    test(`has required properties`, () => {
      const ellipse: Ellipse = {
        radiusX: 10,
        radiusY: 20,
      };
      expect(ellipse.radiusX).toBe(10);
      expect(ellipse.radiusY).toBe(20);
    });

    test(`has optional rotation`, () => {
      const ellipse: Ellipse = {
        radiusX: 10,
        radiusY: 20,
        rotation: Math.PI / 4,
      };
      expect(ellipse.rotation).toBeCloseTo(Math.PI / 4);
    });

    test(`has optional start and end angles`, () => {
      const ellipse: Ellipse = {
        radiusX: 10,
        radiusY: 20,
        startAngle: 0,
        endAngle: Math.PI,
      };
      expect(ellipse.startAngle).toBe(0);
      expect(ellipse.endAngle).toBe(Math.PI);
    });
  });

  describe(`EllipsePositioned type`, () => {
    test(`combines Point and Ellipse`, () => {
      const ellipse: EllipsePositioned = {
        x: 100,
        y: 200,
        radiusX: 50,
        radiusY: 75,
      };
      expect(ellipse.x).toBe(100);
      expect(ellipse.y).toBe(200);
      expect(ellipse.radiusX).toBe(50);
      expect(ellipse.radiusY).toBe(75);
    });
  });
});
