import * as ImageDataGrid from './image-data-grid.js';
import {Grids} from '@ixfxfun/geometry';
import type { Rgb8Bit } from './colour/types.js';

export type Kernel<T> = ReadonlyArray<ReadonlyArray<T>>;
//export type CellWithValue<V> = readonly [ cell: Grids.Cell, value: V | undefined ];
export type CellValueScalar<TCell, TKernel> = Grids.GridCellAndValue<TCell> & { kernel: TKernel };

export type KernelCompute = <V>(offset: Grids.GridCell, value: V) => V;
export type KernelReduce<TCell, TKernel> = (values: Array<CellValueScalar<TCell, TKernel>>) => TCell | undefined;

/**
 * Multiply every element of kernel by the same `scalar` value.
 * Returns new result, input is unmodified
 * @param kernel 
 * @param scalar 
 * @returns 
 */
export const multiply = (kernel: Kernel<number>, scalar: number): Kernel<number> => {
  const rows = kernel.length;
  const cols = kernel[ 0 ].length;
  const copy: Array<Array<number>> = [];
  for (let row = 0; row < rows; row++) {
    copy[ row ] = [];
    for (let col = 0; col < cols; col++) {
      copy[ row ][ col ] = kernel[ row ][ col ] * scalar;
    }
  }
  return copy;
};


export function convolveCell<TCell, TKernel>(cell: Grids.GridCell, kernel: Kernel2dArray<TKernel>, source: Grids.GridReadable<TCell>, reduce: KernelReduce<TCell, TKernel>): TCell | undefined {
  const valuesAtKernelPos: Array<CellValueScalar<TCell, TKernel>> = kernel.map(o => {
    // For a kernel cell vector, get the position in the source grid
    const pos = Grids.offset(source, cell, o.cell, `stop`); // `stop` avoids fringing at extents of image

    // If there's no cell, return undefined
    let kernelValue: TKernel | undefined;
    let sourceValue: TCell | undefined;

    if (pos) {
      sourceValue = source.get(pos, `undefined`);
      kernelValue = o.value;
    }
    //if (!pos) return { cell: o.cell, value: undefined, scalar: NaN } as CellValueScalar<T>;
    return { cell: o.cell, value: sourceValue, kernel: o.value } as CellValueScalar<TCell, TKernel>;
  });
  return reduce(valuesAtKernelPos);
}

/**
 * Performs kernel-based convolution over `image`.
 * @param kernel 
 * @param image 
 */
export function* convolveImage(kernel: Kernel<number>, image: ImageData) {
  //const grid = { rows: image.width, cols: image.height };
  const imageDataAsGrid = ImageDataGrid.wrap(image);
  yield* convolve(kernel, imageDataAsGrid, Grids.By.cells(imageDataAsGrid), rgbReducer);
}

export function* convolve<TCell, TKernel>(kernel: Kernel<TKernel>, source: Grids.GridReadable<TCell>, visitor: Iterable<Grids.GridCell>, reduce: KernelReduce<TCell, TKernel>, origin?: Grids.GridCell): IterableIterator<Grids.GridCellAndValue<TCell>> {
  if (!origin) {
    const kernelRows = kernel.length;
    const kernelCols = kernel[ 0 ].length;
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
 * @returns 
 */
export const kernel2dToArray = <T>(kernel: Kernel<T>, origin?: Grids.GridCell): Kernel2dArray<T> => {
  const offsets: Kernel2dArray<T> = [];
  const rows = kernel.length;
  const cols = kernel[ 0 ].length;
  if (!origin) {
    origin = {
      x: Math.floor(rows / 2),
      y: Math.floor(cols / 2)
    };
  }

  for (let xx = 0; xx < rows; xx++) {
    for (let yy = 0; yy < cols; yy++) {
      const v: Grids.GridCellAndValue<T> = {
        cell: { x: xx - origin.x, y: yy - origin.y },
        value: kernel[ xx ][ yy ]
      }
      offsets.push(v);
      //offsets.push([ { x: xx - origin.x, y: yy - origin.y }, kernel[ xx ][ yy ] ]);
    }
  }
  return offsets;
};

export const rgbReducer: KernelReduce<Rgb8Bit, number> = (values: Array<CellValueScalar<Rgb8Bit, number>>) => {
  let r = 0;
  let g = 0;
  let b = 0;
  let opacity = 0;
  for (const value of values) {
    const rgb = value.value;
    const kernelValue = value.kernel;
    if (!rgb) continue;
    if (rgb.opacity === 0) continue;
    if (kernelValue === 0) continue;
    r += (rgb.r * kernelValue);
    g += (rgb.g * kernelValue);
    b += (rgb.b * kernelValue);
    opacity += ((rgb.opacity ?? 1) * kernelValue);
  }

  const result: Rgb8Bit = {
    r, g, b,
    unit: `8bit`,
    space: `srgb`,
    opacity
  };
  return result;
};
export const identityKernel = [
  [ 0, 0, 0 ],
  [ 0, 1, 0 ],
  [ 0, 0, 0 ]
];

export const edgeDetectionKernel = [
  [ 0, -1, 0 ],
  [ -1, 4, -1 ],
  [ 0, -1, 0 ]
];

export const sharpenKernel = [
  [ 0, -1, 0 ],
  [ -1, 5, -1 ],
  [ 0, -1, 0 ]
];

export const boxBlurKernel = multiply([
  [ 1, 1, 1 ],
  [ 1, 1, 1 ],
  [ 1, 1, 1 ]
], 1 / 9);

export const gaussianBlur3Kernel = multiply([
  [ 1, 2, 1 ],
  [ 2, 4, 2 ],
  [ 1, 2, 1 ]
], 1 / 16);

export const gaussianBlur5Kernel = multiply([
  [ 1, 4, 6, 4, 1 ],
  [ 4, 16, 24, 16, 4 ],
  [ 6, 24, 36, 24, 6 ],
  [ 4, 16, 24, 16, 4 ],
  [ 1, 4, 6, 4, 1 ],
], 1 / 256);

export const unsharpMasking5Kernel = multiply([
  [ 1, 4, 6, 4, 1 ],
  [ 4, 16, 24, 16, 4 ],
  [ 6, 24, -476, 24, 6 ],
  [ 4, 16, 24, 16, 4 ],
  [ 1, 4, 6, 4, 1 ],
], -1 / 256);