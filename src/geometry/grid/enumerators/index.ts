//import type { Cell, GridReadable } from '../Types.js';

export * from './Cells.js';

// export function* withValues<T>(grid: GridReadable<T>, iter: IterableIterator<Cell>) {
//   for (const cell of iter) {
//     yield { cell, value: grid.get(cell, `undefined`) };
//   }
// }