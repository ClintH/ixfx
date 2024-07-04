import * as Grids from '../geometry/Grid.js';
import type { Rgb } from './Colour.js';

export const accessor = (image: ImageData): Grids.CellAccessor<Rgb> => {
  const grid = { rows: image.width, cols: image.height };
  const data = image.data;

  const fn: Grids.CellAccessor<Rgb> = (cell: Grids.Cell, bounds) => {
    const index = Grids.indexFromCell(grid, cell, bounds);
    if (index === undefined) {
      return undefined;
    }
    const pxIndex = index * 4;
    return {
      r: data[ pxIndex ],
      g: data[ pxIndex + 1 ],
      b: data[ pxIndex + 2 ],
      opacity: data[ pxIndex + 3 ],
      space: `srgb`
    };
  };
  return fn;
};
