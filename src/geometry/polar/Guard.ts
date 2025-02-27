import type { Coord } from "./Types.js";

/**
 * Returns true if `p` seems to be a {@link Polar.Coord} (ie has both distance & angleRadian fields)
 * @param p
 * @returns True if `p` seems to be a PolarCoord
 */
export const isPolarCoord = (p: unknown): p is Coord => {
  if ((p as Coord).distance === undefined) return false;
  if ((p as Coord).angleRadian === undefined) return false;
  return true;
};

/**
 * Throws an error if Coord is invalid
 * @param p
 * @param name
 */
export const guard = (p: Coord, name = `Point`) => {
  if (p === undefined) {
    throw new Error(
      `'${ name }' is undefined. Expected {distance, angleRadian} got ${ JSON.stringify(
        p
      ) }`
    );
  }
  if (p === null) {
    throw new Error(
      `'${ name }' is null. Expected {distance, angleRadian} got ${ JSON.stringify(
        p
      ) }`
    );
  }
  if (p.angleRadian === undefined) {
    throw new Error(
      `'${ name }.angleRadian' is undefined. Expected {distance, angleRadian} got ${ JSON.stringify(
        p
      ) }`
    );
  }
  if (p.distance === undefined) {
    throw new Error(
      `'${ name }.distance' is undefined. Expected {distance, angleRadian} got ${ JSON.stringify(
        p
      ) }`
    );
  }
  if (typeof p.angleRadian !== `number`) {
    throw new TypeError(

      `'${ name }.angleRadian' must be a number. Got ${ p.angleRadian }`
    );
  }
  if (typeof p.distance !== `number`) {

    throw new TypeError(`'${ name }.distance' must be a number. Got ${ p.distance }`);
  }

  if (p.angleRadian === null) throw new Error(`'${ name }.angleRadian' is null`);
  if (p.distance === null) throw new Error(`'${ name }.distance' is null`);

  if (Number.isNaN(p.angleRadian)) {
    throw new TypeError(`'${ name }.angleRadian' is NaN`);
  }
  if (Number.isNaN(p.distance)) throw new Error(`'${ name }.distance' is NaN`);
};