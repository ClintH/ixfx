import type { Grid, GridCell, GridPositionBetween, JaggedGrid } from "./types.js";
import type { VisitorTypes } from "./visitors/index.js";
import { to } from "@ixfx/flow/state-machine/state-machine-fns.js";
import { Points } from "@ixfx/geometry";
import { resultThrow } from "@ixfx/guards";
import { applyBounds } from "./apply-bounds.js";
import { cells } from "./enumerators/cells.js";
import { CellPlaceholder, isJaggedGrid, testCell, testGrid } from "./guards.js";
import { offset } from "./offset.js";

type ContiguousSelection = Readonly<{
  start: GridCell;
  end: GridCell;
  kind: `contiguous`;
}>;

type RectangularTwoPointSelection = Readonly<{
  topLeft: GridCell;
  bottomRight: GridCell;
  kind: `rect-two-point`;
}>;

type Selection = ContiguousSelection | RectangularTwoPointSelection;

function normaliseSelection(selection: Selection): Selection {
  if (selection.kind === `contiguous`) {
    if (selection.start.y < selection.end.y)
      return selection;
    if (selection.start.y > selection.end.y)
      return { ...selection, start: selection.end, end: selection.start };
    if (selection.start.x < selection.end.x)
      return selection;
    if (selection.start.x > selection.end.x)
      return { ...selection, start: selection.end, end: selection.start };
    return selection;
  } else if (selection.kind === `rect-two-point`) {
    const xStart = Math.min(selection.topLeft.x, selection.bottomRight.x);
    const xEnd = Math.max(selection.topLeft.x, selection.bottomRight.x);
    const yStart = Math.min(selection.topLeft.y, selection.bottomRight.y);
    const yEnd = Math.max(selection.topLeft.y, selection.bottomRight.y);
    return {
      topLeft: { x: xStart, y: yStart },
      bottomRight: { x: xEnd, y: yEnd },
      kind: `rect-two-point`,
    };
  } else {
    throw new Error(`Unknown selection kind: ${(selection as any).kind}`);
  }
}

function *resolveSelection(selection: Selection, grid: Grid): Generator<GridCell> {
  if (selection.kind === `contiguous`) {
    distanceRowwise(selection.start, selection.end, grid);
  } else if (selection.kind === `rect-two-point`) {
    const cells: GridCell[] = [];
    for (let y = selection.topLeft.y; y <= selection.bottomRight.y; y++) {
      for (let x = selection.topLeft.x; x <= selection.bottomRight.x; x++) {
        cells.push({ x, y });
      }
    }
    return cells;
  } else {
    throw new Error(`Unknown selection kind: ${(selection as any).kind}`);
  }
}

export class GridSelection {
  #cursor: GridCell;
  #selections: Selection[] = [];
  #selectionInProgress: Selection | undefined;
  #grid: Grid;

  constructor(grid: Grid, start: GridCell = { x: 0, y: 0 }) {
    resultThrow(testGrid(grid), testCell(start, `start`));
    this.#grid = grid;
    this.#cursor = start;
  }

  moveCursorByVector(vector: GridCell): GridCell {
    const c = offset(this.#grid, this.#cursor, vector, `wrap`);
    if (c === undefined)
      throw new Error(`Cannot make move, offset returned undefined`);
    this.#cursor = c;
    return c;
  }

  setCursor(cell: GridCell, withSelection: `cancel` | `contiguous`): GridCell {
    this.#cursor = cell;
    if (withSelection === `cancel`) {
      this.#selectionInProgress = undefined;
    } else if (withSelection === `contiguous`) {
      this.extendContiguous(cell);
    }
    console.log(`cursor: ${cell.x},${cell.y}`);
    return this.#cursor;
  }

  get selectionInProgress(): Selection | undefined {
    return this.#selectionInProgress;
  }

  extendContiguous(to: GridCell): ContiguousSelection {
    let sel: ContiguousSelection | undefined;
    if (this.#selectionInProgress !== undefined) {
      if (this.#selectionInProgress.kind !== `contiguous`) {
        this.#selections.push(this.#selectionInProgress);
        this.#selectionInProgress = undefined;
      } else {
        sel = this.#selectionInProgress;
      }
    }

    if (sel === undefined) {
      sel = {
        start: this.#cursor,
        end: to,
        kind: `contiguous`,
      };
    } else {
      sel = {
        ...sel,
        end: to,
      };
    }
    this.#selectionInProgress = sel;
    return sel;
  }

  get cursor(): GridCell {
    return this.#cursor;
  }

  clear(): void {
    this.#selections = [];
  }
}
