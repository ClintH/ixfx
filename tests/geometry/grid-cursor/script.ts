import * as Grid from '../../../packages/geometry/src/grid/index.js';

const grid = {rows:5,cols:5};
const s = new Grid.Cursor.GridSelection(grid);


const parentEl = document.querySelector(`#grid`)!;
for (const row of Grid.By.rows(grid)) {
  const rowEl = document.createElement(`div`);
  rowEl.classList.add(`row`);
  parentEl.appendChild(rowEl);
  for (const cell of row) {
    const cellEl = document.createElement(`div`);
    cellEl.classList.add(`cell`);
    rowEl.appendChild(cellEl);
    cellEl.dataset.x = cell.x.toString();
    cellEl.dataset.y = cell.y.toString();
    cellEl.dataset.key = Grid.cellKeyString(cell);
  }
}


document.addEventListener(`click`, (e) => {
  const clickedEl = (e.target as HTMLElement);
  if (!clickedEl.classList.contains(`cell`)) return;

  const cellEl = clickedEl
  const rowEl = cellEl.parentElement!;
  const rowIndex = [...rowEl.parentElement!.children].indexOf(rowEl);
  const colIndex = [...rowEl.children].indexOf(cellEl);
  s.setCursor({ x: colIndex, y: rowIndex }, `cancel`);
  update();
});

function update() {
  parentEl.querySelectorAll(`.cursor`).forEach(el => el.classList.remove(`cursor`));
  parentEl.querySelectorAll(`.selected`).forEach(el => el.classList.remove(`selected`));

  // Apply cursor
  const cell= parentEl.querySelector(`[data-key="${Grid.cellKeyString(s.cursor)}"]`)!;
  if (cell) {
    cell.classList.add(`cursor`);
  }

  // Apply selection
  const sel = s.selectionInProgress;
  
}