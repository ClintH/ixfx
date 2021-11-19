import {Lines, Paths, Beziers, Drawing, MultiPaths, Points, Rects} from '../dist/bundle.mjs';

const canvas = document.getElementById('lines');


let l1 = Lines.fromPoints({x: 0, y: 0}, {x: 100, y: 100});
let l2 = Lines.fromPoints({x: 100, y: 100}, {x: 200, y: 0});
//let bezier = Beziers.quadratic({x: 200, y: 0}, {x: 300, y: 100}, {x: 200, y: 100})
let b1 = Beziers.quadraticSimple({x: 200, y: 0}, {x: 300, y: 100}, -1);
let b2 = Beziers.quadraticSimple({x: 300, y: 100}, {x: 400, y: 0}, 1);

let m = MultiPaths.fromPaths(l1, l2, b1, b2);

/** @type {CanvasRenderingContext2D} */
const ctx = canvas.getContext('2d');

const clear = () => {
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
};

const drawCompute = (line, where) => {
  const p = Lines.compute(line.a, line.b, where);
  drawDot(p, 3);
};

const drawDot = (pos, size) => {
  ctx.beginPath();
  ctx.fillStyle = 'red';

  // x&y for arc is the center of circle
  ctx.arc(pos.x, pos.y, size, 0, 2 * Math.PI);
  ctx.fill();
};

const drawLine = (line) => {
  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'black';

  Drawing.line(line, ctx);

  const bbox = line.bbox();
  const bboxPts = bbox.corners;

  ctx.strokeStyle = 'silver';
  Drawing.points(ctx, bboxPts);
  Drawing.pointLabels(ctx, bboxPts);
};

const drawPath = (path, amt) => {
  ctx.strokeStyle = 'black';
  ctx.fillStyle = 'black';
  Drawing.paths(ctx, ...path.segments);

  const p = path.compute(amt, true);
  drawDot(p, 3);
};


let amt = 0;

const draw = function () {
  clear();
  drawPath(m, amt);
  amt += 0.005;
  if (amt > 1) amt = 0;
  window.requestAnimationFrame(draw);
};
window.requestAnimationFrame(draw);

// function drawQuadratic(bezier) {
//   ctx.fillStyle = 'black';
//   Drawing.quadraticBezier(bezier, ctx, false);
//   const bboxPts = bezier.bbox().corners;
//   Drawing.pointsEnclosed(ctx, bboxPts);
//   Drawing.pointLabels(ctx, bboxPts);
// }


//drawQuadratic(bezier);
//drawCompute(l, 0.5);