import { Grids, Points } from '../../../dist/geometry.js';
import { visitPanel } from './visit.js';
import { offsetPanel } from './offset.js';
import { linePanel } from './line.js';
import { tabSet } from '../../../dist/dom.js';
import { Draw } from './draw.js';

const canvasEl = /** @type {HTMLCanvasElement} */(document.getElementById(`grid`));
const coordsEl = /** @type HTMLElement */(document.getElementById('coords'));

let grid = {
  rows: 10,
  cols: 10,
  size: 50
}
const draw = new Draw(grid);

const tabbedPanels = tabSet({
  panels: [
    visitPanel(grid, draw), offsetPanel(grid, draw),
    linePanel(grid, draw)
  ],
  parent: `#tools`,
  onPanelChanging: (newPanel, oldPanel) => {
    draw.reset();
  },
  preselectId: `line`
});

canvasEl.addEventListener(`pointermove`, event => {
  let ptr = { x: event.offsetX, y: event.offsetY };
  ptr = scaleCanvasCoordinateForGrid(ptr);
  const cell = Grids.cellAtPoint(grid, ptr);
  draw.setHighlighted(cell);
  if (cell) {
    coordsEl.innerHTML = `Cell: ${cell.x},${cell.y}`;
  } else {
    coordsEl.innerHTML = ``;
  }
});

/**
 * 
 * @param {import('../../../dist/geometry.js').Point} point 
 * @returns 
 */
const scaleCanvasCoordinateForGrid = (point) => {
  const size = canvasEl.getBoundingClientRect();
  const actualCellSize = size.width / 10;
  const scaling = grid.size / actualCellSize;
  return Points.multiplyScalar(point, scaling);
}

canvasEl.addEventListener(`pointerup`, event => {
  let ptr = { x: event.offsetX, y: event.offsetY };
  ptr = scaleCanvasCoordinateForGrid(ptr);
  tabbedPanels.notify(`click`, Grids.cellAtPoint(grid, ptr));
});


draw.draw();
