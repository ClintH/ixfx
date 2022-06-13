import {parentSizeCanvas} from '../../../dist/dom.js';
import {Drawing} from '../../../dist/visual.js';
import {Polar, Lines} from '../../../dist/geometry.js';
import {Shapes} from '../../../dist/geometry.js';

const canvasEl = document.getElementById(`plot`);
parentSizeCanvas('#plot', (args) => {
  console.log('resize');
  draw();
});

/** @type {CanvasRenderingContext2D} */
const ctx = canvasEl.getContext(`2d`);

// /**
//  * 
//  * @param {number} points 
//  * @param {number} inner 
//  * @param {number} outer 
//  * @param {{x:number, y:number}} origin
//  */
// const starburst = (points, inner, outer, origin) => {
//   Drawing.circle(ctx, {...origin, radius: inner}, {strokeStyle: `black`});
//   Drawing.circle(ctx, {...origin, radius: outer}, {strokeStyle: `brown`});

//   const angle = Math.PI * 2 / points;
//   const angleHalf = angle / 2;
//   let a = 0;

//   let pts = [];
//   for (let i = 0; i < points; i++) {
//     const peak = Polar.toCartesian(outer, a, origin);

//     Drawing.dot(ctx, peak, {fillStyle: `black`});

//     const left = Polar.toCartesian(inner, a - angleHalf, origin);
//     const right = Polar.toCartesian(inner, a + angleHalf, origin);
//     Drawing.dot(ctx, left, {fillStyle: `yellow`});
//     Drawing.dot(ctx, right, {fillStyle: `orange`});


//     //lines.push(...Lines.joinPointsToLines(left, peak, right));
//     pts.push(left);
//     pts.push(peak);
//     if (i + 1 < points) pts.push(right);

//     a += angle;

//   }

//   //Drawing.line(ctx, lines, {strokeStyle: `purple`, fillStyle: `pink`});
//   Drawing.connectedPoints(ctx, pts, {loop: true, strokeStyle: `red`, fillStyle: `orange`});
// }

const draw = () => {
  const pts = Shapes.starburst(300, 1000000, 150, {x: canvasEl.width / 2, y: canvasEl.height / 2}, {rotate: true});
  Drawing.connectedPoints(ctx, pts, {loop: true, fillStyle: `orange`, strokeStyle: `red`});
  console.log(`wtf`)
}
