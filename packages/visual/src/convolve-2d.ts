import type { Rgb8Bit } from './colour/types.js';
import { Grids } from '@ixfx/geometry';
import * as ImageDataGrid from './image-data-grid.js';

export type Kernel<T> = ReadonlyArray<readonly T[]>;
// export type CellWithValue<V> = readonly [ cell: Grids.Cell, value: V | undefined ];
export type CellValueScalar<TCell, TKernel> = Grids.GridCellAndValue<TCell> & { kernel: TKernel };

export type KernelCompute = <V>(offset: Grids.GridCell, value: V) => V;

/**
 * Reduces an array of values to a single value. Returns undefined if no values are present.
 *
 * In-built reducers: {@link averageNumberReducer} (can reduce numbers), {@link rgbReducer} (can reduce Rgb8Bit values)
 * @param values Array of values to reduce
 * @returns Reduced value or undefined if no values are present
 */
export type KernelReduce<TCell, TKernel> = (values: Array<CellValueScalar<TCell, TKernel>>) => TCell | undefined;

export function averageNumberReducer(values: Array<CellValueScalar<number, number>>): number | undefined {
  let sum = 0;
  let count = 0;
  for (const value of values) {
    if (value.value === undefined)
      continue;
    sum += value.value * value.kernel;
    count += value.kernel;
  }
  if (count === 0)
    return undefined;
  return sum / count;
}

/**
 * Multiply every element of kernel by the same `scalar` value.
 * Returns new result, input is unmodified
 * @param kernel
 * @param scalar
 * @returns Kernel with every element multiplied by `scalar`
 */
export function multiply(kernel: Kernel<number>, scalar: number): Kernel<number> {
  const rows = kernel.length;
  const cols = kernel[0].length;
  const copy: number[][] = [];
  for (let row = 0; row < rows; row++) {
    copy[row] = [];
    for (let col = 0; col < cols; col++) {
      copy[row][col] = kernel[row][col] * scalar;
    }
  }
  return copy;
}

export function convolveCell<TCell, TKernel>(cell: Grids.GridCell, kernel: Kernel2dArray<TKernel>, source: Grids.GridReadable<TCell>, reduce: KernelReduce<TCell, TKernel>): TCell | undefined {
  const valuesAtKernelPos: Array<CellValueScalar<TCell, TKernel>> = kernel.map((o) => {
    // For a kernel cell vector, get the position in the source grid
    const pos = Grids.offset(source, cell, o.cell, `stop`); // `stop` avoids fringing at extents of image

    // If there's no cell, return undefined
    // let kernelValue: TKernel | undefined;
    let sourceValue: TCell | undefined;

    if (pos) {
      sourceValue = source.get(pos, `undefined`);
      // kernelValue = o.value;
    }
    // if (!pos) return { cell: o.cell, value: undefined, scalar: NaN } as CellValueScalar<T>;
    return { cell: o.cell, value: sourceValue, kernel: o.value } as CellValueScalar<TCell, TKernel>;
  });
  return reduce(valuesAtKernelPos);
}

/**
 * Performs kernel-based convolution over `image`.
 * @param kernel
 * @param image
 */
export function *convolveImage(kernel: Kernel<number>, image: ImageData): Generator<Grids.GridCellAndValue<Rgb8Bit>, void, any> {
  // const grid = { rows: image.width, cols: image.height };
  const imageDataAsGrid = ImageDataGrid.wrap(image);
  yield* convolve(kernel, imageDataAsGrid, Grids.By.cells(imageDataAsGrid), rgbReducer);
}

/**
 * Performs kernel-based convolution over a grid, mutating the source grid with the results.
 *
 * ```js
 * const gridData = Grids.Array2d.wrapMutable(gridArray);
 * Convolve2d.convolveMutateGrid(
 *    Convolve2d.gaussianBlur3Kernel, // Use the Gaussian blur kernel
 *    gridData,  // Provide grid values in an accessible form
 *    Convolve2d.averageNumberReducer,
 *    (conv, original) => {
 *      return interpolate(0.1, original, conv);
 *   }
 * );
 * ```
 * @param kernel Kernel data
 * @param source Source data
 * @param reduce Function to combine values at a position
 * @param blend Optional function to blend the convolved value with the original value. If not provided, the convolved value will replace the original value.
 * @param visitor Visitor to iterate over the source grid. If not provided, all cells will be visited.
 * @param origin Optional origin of the kernel. If not provided, the center of the kernel will be used.
 * @returns Returns 'source' grid, which has been mutated with the results of the convolution.
 */
export function convolveMutateGrid<TCell, TKernel>(kernel: Kernel<TKernel>, source: Grids.GridWritable<TCell> & Grids.GridReadable<TCell>, reduce: KernelReduce<TCell, TKernel>, blend?: (conv: TCell, original: TCell) => TCell, visitor?: Iterable<Grids.GridCell>, origin?: Grids.GridCell): Grids.GridWritable<TCell> & Grids.GridReadable<TCell> {
  const cellVisitor = visitor ?? Grids.By.cells(source);
  const result = convolve(kernel, source, cellVisitor, reduce, origin);
  for (const r of result) {
    if (typeof r.value === `undefined`)
      continue;
    if (blend) {
      source.set(blend(r.value, source.get(r.cell, `undefined`)!), r.cell);
    } else {
      source.set(r.value, r.cell);
    }
  }
  return source;
}

export function *convolve<TCell, TKernel>(kernel: Kernel<TKernel>, source: Grids.GridReadable<TCell>, visitor: Iterable<Grids.GridCell>, reduce: KernelReduce<TCell, TKernel>, origin?: Grids.GridCell): IterableIterator<Grids.GridCellAndValue<TCell>> {
  if (!origin) {
    const kernelRows = kernel.length;
    const kernelCols = kernel[0].length;
    origin = { x: Math.floor(kernelRows / 2), y: Math.floor(kernelCols / 2) };
  }

  const asArray = kernel2dToArray(kernel, origin);
  // for (const c of visitor) {
  //   const v = convolveCell<V>(c, asArray, source, access, reduce);
  //   yield [ c, v ];
  // }
  for (const cell of visitor) {
    const value = convolveCell<TCell, TKernel>(cell, asArray, source, reduce);
    yield { cell, value };
  }
}

export type Kernel2dArray<T> = Array<Grids.GridCellAndValue<T>>;

/**
 * For a given kernel, returns an array of offsets. These
 * consist of a cell offset (eg `{x:-1,y:-1}`) and the value at that kernel position.
 * @param kernel
 * @param origin
 * @returns Array of offsets and values
 */
export function kernel2dToArray<T>(kernel: Kernel<T>, origin?: Grids.GridCell): Kernel2dArray<T> {
  const offsets: Kernel2dArray<T> = [];
  const rows = kernel.length;
  const cols = kernel[0].length;
  if (!origin) {
    origin = {
      x: Math.floor(rows / 2),
      y: Math.floor(cols / 2),
    };
  }

  for (let xx = 0; xx < rows; xx++) {
    for (let yy = 0; yy < cols; yy++) {
      const v: Grids.GridCellAndValue<T> = {
        cell: { x: xx - origin.x, y: yy - origin.y },
        value: kernel[xx][yy],
      };
      offsets.push(v);
      // offsets.push([ { x: xx - origin.x, y: yy - origin.y }, kernel[ xx ][ yy ] ]);
    }
  }
  return offsets;
}

export function rgbReducer(values: Array<CellValueScalar<Rgb8Bit, number>>): Rgb8Bit | undefined {
  let r = 0;
  let g = 0;
  let b = 0;
  let opacity = 0;
  for (const value of values) {
    const rgb = value.value;
    const kernelValue = value.kernel;
    if (!rgb)
      continue;
    if (rgb.opacity === 0)
      continue;
    if (kernelValue === 0)
      continue;
    r += (rgb.r * kernelValue);
    g += (rgb.g * kernelValue);
    b += (rgb.b * kernelValue);
    opacity += ((rgb.opacity ?? 1) * kernelValue);
  }

  const result: Rgb8Bit = {
    r,
    g,
    b,
    unit: `8bit`,
    space: `srgb`,
    opacity,
  };
  return result;
};
export const identityKernel: number[][] = [
  [0, 0, 0],
  [0, 1, 0],
  [0, 0, 0],
];

export const edgeDetectionKernel: number[][] = [
  [0, -1, 0],
  [-1, 4, -1],
  [0, -1, 0],
];

export const sharpenKernel: number[][] = [
  [0, -1, 0],
  [-1, 5, -1],
  [0, -1, 0],
];

export const boxBlurKernel: Kernel<number> = multiply([
  [1, 1, 1],
  [1, 1, 1],
  [1, 1, 1],
], 1 / 9);

export const gaussianBlur3Kernel: Kernel<number> = multiply([
  [1, 2, 1],
  [2, 4, 2],
  [1, 2, 1],
], 1 / 16);

export const gaussianBlur5Kernel: Kernel<number> = multiply([
  [1, 4, 6, 4, 1],
  [4, 16, 24, 16, 4],
  [6, 24, 36, 24, 6],
  [4, 16, 24, 16, 4],
  [1, 4, 6, 4, 1],
], 1 / 256);

export const unsharpMasking5Kernel: Kernel<number> = multiply([
  [1, 4, 6, 4, 1],
  [4, 16, 24, 16, 4],
  [6, 24, -476, 24, 6],
  [4, 16, 24, 16, 4],
  [1, 4, 6, 4, 1],
], -1 / 256);