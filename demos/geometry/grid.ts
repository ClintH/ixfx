/* eslint-disable */
import * as Grids from '../../src/geometry/Grid.js';
import * as Series from '../../src/Series.js';
import * as Producers from '../../src/Generators.js';
import * as Sets from '../../src/collections/Set.js';


// ---------------------------------
// Walk
let cellEquals = Grids.cellEquals;

const testWalk = function (walkerName: string, canvasId:string) {
  const grid = {rows: 10, cols: 10, size: 15};
  let walkHoverCell = {x: 0, y: 0};
  let walkStart = {x:5, y:5};
  let canvasEl = document.getElementById(canvasId) as HTMLCanvasElement;
  if (canvasEl === null) { 
    console.log(`Canvas element not found ${canvasId}`);
    return;
  }
  let c = (canvasEl as HTMLCanvasElement).getContext('2d');
  
  canvasEl.addEventListener('pointermove', (evt) => {
    const cell = Grids.getCell({x: evt.offsetX, y: evt.offsetY}, grid);
    walkHoverCell = cell;
    if (cell !== undefined) walkStart = cell;
    runAndDraw();
  });

  const runAndDraw = () => {
    let hueSeries = Series.fromGenerator(Producers.numericRange(1, 0, 360, true));
    let walker = null;
    if (walkerName == 'byRow')
      walker = Grids.walkByRow(grid, walkStart, true);
    else if (walkerName == 'byCol')
      walker = Grids.walkByCol(grid, walkStart, true);
    else throw Error('Unknown walkerName');

    for (const cell of walker) {
      // Draw coloured rect for cell
      let r = Grids.cellCornerRect(cell, grid);
      c.moveTo(cell.x, cell.y);
      let hue = hueSeries.value; // Magically moves along hue with each call
      c.fillStyle = `hsl(${hue}, 50%,50%)`;
      if (cellEquals(cell, walkHoverCell))
        c.fillStyle = 'black';
      c.fillRect(r.x, r.y, r.width, r.height);

      // Draw a dot in the middle
      let middle = Grids.cellMiddle(cell, grid);
      c.fillStyle = 'white';
      c.fillRect(middle.x, middle.y, 1, 1);
    }
  }

  runAndDraw();
}
testWalk(`byCol`,`walkByCol`);
testWalk(`byRow`,`walkByRow`);

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

  const start = selectedRingCell === undefined ? {x: 5, y: 5} : selectedRingCell;
  const perim = Grids.getSquarePerimeter(perimGrid, perimDistance, start, Grids.BoundsLogic.Stop);

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

  const line = Grids.getLine(start, end);
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
const delayMs = 10;

const testVisitor = (visitorFn, canvasId) => {  
  const canvasEl = (document.getElementById(canvasId) as HTMLCanvasElement);
  if (canvasEl === null) {
    console.log(`Canvas not found: ${canvasId}`);
    return;
  }
  const c = canvasEl.getContext('2d');
  canvasEl.addEventListener(`click`, (evt) => {
    const clicked = Grids.getCell({x: evt.offsetX, y: evt.offsetY}, visitorGrid);
    visitorStart = clicked;
    reset();
  });

  const visited = new Sets.MutableStringSet<Grids.Cell>(c => Grids.cellKeyString(c));
  let visitorStart = {x: 20, y: 20};
  let start = visitorStart;
  let startedTime = window.performance.now();
  let v;
  let isRunning = false;
 
  const draw = () => {
    for (const cell of Grids.walkByRow(visitorGrid)) {
      let r = Grids.cellCornerRect(cell, visitorGrid);
      c.moveTo(cell.x, cell.y);
      c.fillStyle = visited.has(cell) ? 'black' : 'silver';
      if (cellEquals(cell, start)) c.fillStyle = 'red';
      c.fillRect(r.x, r.y, r.width, r.height);
    }
  }

  const reset = () => {
    start = visitorStart ?? {x: 20, y: 20}
    visited.clear();
    v = Grids.visitor(visitorFn, visitorGrid, start, visited);
    if (!isRunning) setTimeout(run, delayMs);
  }

  const run = () => {
    const {cell, done} = v.next();
    if (done) {
      isRunning = false;
      return;
    }
    draw();
    setTimeout(run, delayMs);
  }
  reset();  
}
testVisitor(Grids.visitorDepth, `visitorDepth`);
testVisitor(Grids.visitorBreadth,  `visitorBreadth`);
testVisitor(Grids.visitorRandom, `visitorRandom`);


