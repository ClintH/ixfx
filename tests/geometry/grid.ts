import * as Grids from '../../src/geometry/Grid.js';
import * as Series from '../../src/Series.js';
import * as Producers from '../../src/Producers.js';
import * as Sets from '../../src/collections/Sets.js';


// ---------------------------------
// Walk
const walkGrid = {rows: 10, cols: 10, size: 15};
let walkHoverCell = {x: 0, y: 0};
let cellEquals = Grids.cellEquals;
const walkTest = 'byCol';
document.getElementById('walkTestCanvas').addEventListener('pointermove', (evt) => {
  const cell = Grids.getCell({x: evt.offsetX, y: evt.offsetY}, walkGrid);
  walkHoverCell = cell;
  testWalk(walkTest, walkGrid);
});
const testWalk = function (walkerName: string, grid: Grids.Grid & Grids.GridVisual) {
  let walker = null;
  if (walkerName == 'byRow')
    walker = Grids.walkByRow(grid, {x: 5, y: 5}, true);
  else if (walkerName == 'byCol')
    walker = Grids.walkByCol(grid, {x: 5, y: 5}, true);
  else throw Error('Unknown walkerName');

  let c = (document.getElementById('walkTestCanvas') as HTMLCanvasElement).getContext('2d');
  let hueSeries = Series.fromGenerator(Producers.numericRange(1, 0, 360, true));

  for (const cell of walker) {
    //console.log(`${cell.x}, ${cell.y}`);

    let r = Grids.cellCornerRect(cell, grid);
    c.moveTo(cell.x, cell.y);
    let hue = hueSeries.value;
    c.fillStyle = `hsl(${hue}, 50%,50%)`;
    if (cellEquals(cell, walkHoverCell))
      c.fillStyle = 'black';

    c.fillRect(r.x, r.y, r.width, r.height);

    let mid = Grids.cellMiddle(cell, grid);
    c.fillStyle = 'white';
    c.fillRect(mid.x, mid.y, 1, 1);
  }
}
testWalk(walkTest, walkGrid);

// -----------------------------
// Square perimeter & Neighbours
let selectedRingCell = undefined;
let perimGrid = {rows: 11, cols: 11, size: 15};
let perimDistance = 3;
document.getElementById('ringTestCanvas').addEventListener('pointermove', (evt) => {
  selectedRingCell = Grids.getCell({x: evt.offsetX, y: evt.offsetY}, perimGrid);
  testPerimeter();
});
const testPerimeter = function () {
  let c = (document.getElementById('ringTestCanvas') as HTMLCanvasElement).getContext('2d');
  let walker = Grids.walkByRow(perimGrid);

  let start = selectedRingCell === undefined ? {x: 5, y: 5} : selectedRingCell;
  let perim: Grids.Cell[] = Grids.getSquarePerimeter(perimGrid, perimDistance, start, Grids.BoundsLogic.Stop);

  let neighbours = Grids.neighbours(perimGrid, start, Grids.BoundsLogic.Wrap);

  for (const cell of walker) {
    let r = Grids.cellCornerRect(cell, perimGrid);
    c.moveTo(cell.x, cell.y);
    const onPerim = perim.find(c => cellEquals(c, cell))
    c.fillStyle = onPerim ? 'black' : 'silver';
    if (cellEquals(cell, start)) c.fillStyle = 'red';
    c.fillRect(r.x, r.y, r.width, r.height);

    // Show neighours with yellow outline
    if (neighbours.find(c => cellEquals(c, cell))) {
      c.strokeStyle = 'yellow';
      c.strokeRect(r.x, r.y, r.width, r.height);
    }
  }
}
testPerimeter();

// ------------------------------
// Point-to-point
let lineGrid = {rows: 40, cols: 40, size: 4};
let lineEndCell = undefined;
document.getElementById('lineTestCanvas').addEventListener('pointermove', (evt) => {
  lineEndCell = Grids.getCell({x: evt.offsetX, y: evt.offsetY}, lineGrid);
  testLine();
});
const testLine = function () {
  let c = (document.getElementById('lineTestCanvas') as HTMLCanvasElement).getContext('2d');
  let walker = Grids.walkByRow(lineGrid);
  let start = {x: 10, y: 10}
  let end = lineEndCell === undefined ? {x: 0, y: 0} : lineEndCell;

  let line: Grids.Cell[] = Grids.getLine(start, end);
  for (const cell of walker) {
    let r = Grids.cellCornerRect(cell, lineGrid);
    c.moveTo(cell.x, cell.y);
    const onLine = line.find(c => cellEquals(c, cell))
    c.fillStyle = onLine ? 'black' : 'silver';
    if (cellEquals(cell, start)) c.fillStyle = 'red';
    if (cellEquals(cell, end)) c.fillStyle = 'blue';

    c.fillRect(r.x, r.y, r.width, r.height);
  }
}
testLine();

// ------------------
// Visitor
let visitorGrid = {rows: 40, cols: 40, size: 4};
let visitorStart = undefined;
const delayMs = 10;
const testVisitor = function () {
  let start = visitorStart ?? {x: 20, y: 20}
  let c = (document.getElementById('visitorTestCanvas') as HTMLCanvasElement).getContext('2d');
  let visited = new Sets.MutableValueSet<Grids.Cell>(c => Grids.cellKeyString(c));
  let v = Grids.visitor(Grids.visitorDepth, visitorGrid, start, visited);

  const draw = () => {
    for (const cell of Grids.walkByRow(visitorGrid)) {
      let r = Grids.cellCornerRect(cell, visitorGrid);
      c.moveTo(cell.x, cell.y);
      c.fillStyle = visited.has(cell) ? 'black' : 'silver';
      if (cellEquals(cell, start)) c.fillStyle = 'red';
      c.fillRect(r.x, r.y, r.width, r.height);
    }
  }
  const run = () => {

    let cell = v.next().value;
    if (cell == undefined) {
      console.log('Generator done?')
      return;
    }
    draw();
    if (!v.done) setTimeout(run, delayMs);
  }
  setTimeout(run, delayMs);
}
testVisitor();