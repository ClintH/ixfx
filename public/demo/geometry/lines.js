import {Lines, Paths, Beziers, Drawing, MultiPaths, Points, Rects} from '/dist/bundle.js';

// Returns a drawing helper object bound to a given canvas element
// It contains simple drawing primitives
const drawing = (canvasEl) => {
  if (canvasEl === undefined) throw Error('canvasEl is undefined');
  if (canvasEl === null) throw Error('canvasEl is null');

  /** @type {CanvasRenderingContext2D} */
  const ctx = canvasEl.getContext('2d');

  // Start drawing 10,10 pixels in.
  ctx.translate(10, 10);

  // Clear canvas
  const clear = () => {
    // Need to reset the translation so that whole canvas is cleared
    ctx.save();
    ctx.resetTransform();
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
    ctx.restore(); // Restore padding
  };

  // const compute = (line, where) => {
  //   const p = Lines.compute(line.a, line.b, where);
  //   dot(p, 3);
  // };

  // Draws a path
  const path = (path, colour = 'black') => {
    ctx.strokeStyle = colour;
    ctx.fillStyle = 'black';
    Drawing.paths(ctx, path.segments);
  };

  // Draws a filled circle
  const dot = (pos, size, colour = 'red') => {
    ctx.beginPath();
    ctx.fillStyle = colour;

    // x&y for arc is the center of circle
    ctx.arc(pos.x, pos.y, size, 0, 2 * Math.PI);
    ctx.fill();
  };

  // Draws a dot at a given journey along path (As a percentage, ie: 0 is start, 0.5 halfway, 1 end)
  const dotOnPath = (path, journeyAmt) => {
    if (Number.isNaN(journeyAmt)) throw Error('journeyAmt is NaN');
    const p = path.compute(journeyAmt, true);
    dot(p, 3);
  }

  // Draws a line
  const line = (line, colour = 'black') => {
    Drawing.line(ctx, line, {strokeStyle: colour});

    const bbox = line.bbox();
    const bboxPts = bbox.corners;

    return; // Remove this to draw bounding box
    Drawing.connectedPoints(ctx, [...bboxPts, bboxPts[0]], {strokeStyle: 'silver'});
    Drawing.pointLabels(ctx, bboxPts);
  };

  const quadratic = (bezier, colour = 'black') => {
    // Draw bezier curve
    ctx.strokeStyle = colour;
    const debug = true; // When true, the control point is visualised
    Drawing.quadraticBezier(ctx, bezier, debug);

    return; // Remove this to draw the bounding box of curbe
    // Get & draw bounding box of bezier
    const bboxPts = bezier.bbox().corners;
    ctx.strokeStyle = 'silver';
    ctx.fillStyle = colour; // fillStyle is just for drawing labeled points of bounding box
    Drawing.connectedPoints(ctx, bboxPts, {loop: true});
    Drawing.pointLabels(ctx, bboxPts); // Draws numbered corners
  }

  // Empty draw function, gets overriden later
  const draw = () => {}

  // Empty setup function, gets override later
  const setup = () => {return {};}

  const state = {};

  // Return an assemblage of the drawing functions defined above
  return {state, ctx, clear, path, dot, quadratic, dotOnPath, line, setup, draw}
}

// --- Line
// Define two lines by their start & end points
const l1 = Lines.fromPoints({x: 0, y: 0}, {x: 350, y: 120});
// Create a 'drawing toolbox' to manage drawing to the bezierCanvas element
const lineDrawing = drawing(document.getElementById('lineCanvas'));
lineDrawing.state = {amt: 0}

// Draw canvas by drawing quadratic, the dot, and animate dot
lineDrawing.draw = () => {
  const state = lineDrawing.state;
  lineDrawing.line(l1);
  lineDrawing.dotOnPath(l1, state.amt);

  // Move dot along path each time it loops, 
  // resetting to zero once 100% is reached
  state.amt += 0.005;
  if (state.amt > 1) state.amt = 0;
}


// --- Bezier
// Define bezier's start (A), end (B) and handle (C) points:
const bezier = Beziers.quadratic({x: 0, y: 0}, {x: 350, y: 120}, {x: 170, y: 20})
// Create a 'drawing toolbox' to manage drawing to the bezierCanvas element
const bezierDrawing = drawing(document.getElementById('bezierCanvas'));
bezierDrawing.state = {amt: 0}

// Draw canvas by drawing quadratic, the dot, and animate dot
bezierDrawing.draw = () => {
  const state = bezierDrawing.state;
  bezierDrawing.quadratic(bezier);
  bezierDrawing.dotOnPath(bezier, state.amt);

  // Move dot along path each time it loops, 
  // resetting to zero once 100% is reached
  state.amt += 0.005;
  if (state.amt > 1) state.amt = 0;
}

// --- Path made up of multiple lines & beziers
// Define two lines by their start & end points
const l3 = Lines.fromPoints({x: 0, y: 0}, {x: 100, y: 100});
const l4 = Lines.fromPoints({x: 100, y: 100}, {x: 200, y: 0});

// Define two simple beziers. 
// A simple bezier has a start, end and 'bend' amount. Bend ranges from -1 to 1.
const b1 = Beziers.quadraticSimple({x: 200, y: 0}, {x: 300, y: 100}, -1); // Bend of -1... this is the sunken curve
const b2 = Beziers.quadraticSimple({x: 300, y: 100}, {x: 400, y: 0}, 1);  // Bend of 1... this is the final bulge

// Create a path from four separate paths
const multiPath = MultiPaths.fromPaths(l3, l4, b1, b2);
// Create a 'drawing toolbox' to manage drawing to the pathCanvas element
const multiPathDrawing = drawing(document.getElementById('multiPathCanvas'));
multiPathDrawing.state = {amt: 0};

// Draw canvas by drawing the path, the dot, and animate the dot
multiPathDrawing.draw = () => {
  const state = multiPathDrawing.state;
  multiPathDrawing.path(multiPath);
  multiPathDrawing.dotOnPath(multiPath, state.amt);

  // Move dot along path each time it loops, 
  // resetting to zero once 100% is reached
  state.amt += 0.005;
  if (state.amt > 1) state.amt = 0;
}

// Add the two 'toolboxes' in an array so some operations can be easily repeated
const drawings = [bezierDrawing, multiPathDrawing, lineDrawing];

// Setup drawings, using the array to call the same function on each item
drawings.forEach(d => d.setup());

// Draw functions gets called repeatedly
const loop = function () {
  // Clear each drawing
  drawings.forEach(d => d.clear());

  // Draws each drawing
  drawings.forEach(d => d.draw());

  window.requestAnimationFrame(loop);
};
window.requestAnimationFrame(loop);
