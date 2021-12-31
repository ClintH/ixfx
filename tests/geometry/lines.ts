import * as Lines from '../../src/geometry/Line';
import * as Paths from '../../src/geometry/Path';
import * as Beziers from '../../src/geometry/Bezier';
import * as Drawing from '../../src/visualisation/Drawing';
import * as MultiPaths from '../../src/geometry/MultiPath';
// /// <reference path="../../public/lib/svg.3.1.1.d.ts"/>
// import * as Svgjs from '../../public/lib/svg.esm';
import {SVG} from '@svgdotjs/svg.js'
import {pingPongPercent} from '../../src/Producers';

// Drawing properties
const lineColour = '#11191f';
const bgColour = '#edf0f3';
const pingPongInterval = 0.01;
const dotDrawOpts = {radius: 3, fillStyle: '#f516d0'};

const getElements = (idPrefix: string): [HTMLCanvasElement, HTMLElement] => {
  const canvasEl = document.getElementById(idPrefix + 'Canvas') as HTMLCanvasElement;
  const svgEl = document.getElementById(idPrefix + 'Svg');
  if (canvasEl === undefined) throw Error('canvasEl is undefined');
  if (svgEl === null) throw Error('svgEl is null');
  return [canvasEl, svgEl];
}

const clear = (ctx: CanvasRenderingContext2D, canvasEl: HTMLCanvasElement) => {
  // Need to reset the translation so that whole canvas is cleared
  ctx.save();
  ctx.resetTransform();
  ctx.fillStyle = bgColour;
  ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
  ctx.restore(); // Restore padding

};

// --- Line
const testLine = () => {

  const [canvasEl, svgEl] = getElements('line');  // get lineCanvas and lineSvg elements
  const ctx = canvasEl.getContext('2d');          // get drawing context
  ctx.translate(5, 5);
  const drawHelper = Drawing.makeHelper(ctx);   // Make a helper

  // Define two lines by their start & end points
  const line = Lines.fromPoints({x: 0, y: 0}, {x: 350, y: 120});

  const svg = SVG().addTo(svgEl).size(350, 120)
  const lineSvg = svg.line(line.toArray()).attr({stroke: lineColour});
  const dotSvg = svg.circle(dotDrawOpts.radius * 2).attr({fill: dotDrawOpts.fillStyle});

  // Loop back and forth between 0 and 1
  const progression = pingPongPercent(pingPongInterval);
  let amt = 0;

  const redraw = () => {
    clear(ctx, canvasEl);

    // Draw the line
    drawHelper.line(line, {strokeStyle: lineColour});

    // Calc x,y along long at a given amt and draw a dot there
    const dotPos = line.compute(amt);
    drawHelper.dot(dotPos, dotDrawOpts);

    // Move SVG dot. Since position is from top-left corner, we need to adjust
    dotSvg.move(dotPos.x - dotDrawOpts.radius, dotPos.y - dotDrawOpts.radius);
  }

  const update = () => {
    amt = progression.next().value;
  }
  return {redraw, update}
}

// --- Bezier
const testBezier = () => {
  const [canvasEl, svgEl] = getElements('bezier'); // get lineCanvas and lineSvg elements
  const ctx = canvasEl.getContext('2d');          // get drawing context
  const drawHelper = Drawing.makeHelper(ctx); // Make a helper
  ctx.translate(5, 5);

  // Define bezier's start (A), end (B) and handle (C) points:
  const bezier = Beziers.quadratic({x: 0, y: 0}, {x: 350, y: 120}, {x: 170, y: 20})

  // Make SVG
  const svg = SVG().addTo(svgEl).size(350, 120)
  const bezierSvg = svg.path(bezier.toSvgString()).attr({fill: 'transparent', stroke: lineColour});
  const dotSvg = svg.circle(dotDrawOpts.radius * 2).attr({fill: dotDrawOpts.fillStyle});

  // Loop back and forth between 0 and 1
  const progression = pingPongPercent(pingPongInterval);
  let amt = 0;

  const redraw = () => {
    clear(ctx, canvasEl);

    // Draw bezier
    drawHelper.quadraticBezier(bezier, {strokeStyle: lineColour})

    // Calc x,y along long at a given amt and draw a dot there
    const dotPos = bezier.compute(amt);
    drawHelper.dot(dotPos, dotDrawOpts);

    // Move SVG dot. Since position is from top-left corner, we need to adjust
    dotSvg.move(dotPos.x - dotDrawOpts.radius, dotPos.y - dotDrawOpts.radius);
  }

  const update = () => {
    amt = progression.next().value;
  }
  return {redraw, update}
}

// --- Path made up of multiple lines & beziers
const testMultiPath = () => {
  const [canvasEl, svgEl] = getElements('multiPath'); // get lineCanvas and lineSvg elements
  const ctx = canvasEl.getContext('2d');          // get drawing context
  const drawHelper = Drawing.makeHelper(ctx); // Make a helper
  ctx.translate(5, 5);

  // Define two lines by their start & end points
  const l3 = Lines.fromPoints({x: 0, y: 0}, {x: 100, y: 100});
  const l4 = Lines.fromPoints({x: 100, y: 100}, {x: 200, y: 0});

  // Define two simple beziers. 
  // A simple bezier has a start, end and 'bend' amount. Bend ranges from -1 to 1.
  const b1 = Beziers.quadraticSimple({x: 200, y: 0}, {x: 300, y: 100}, -1); // Bend of -1... this is the sunken curve
  const b2 = Beziers.quadraticSimple({x: 300, y: 100}, {x: 400, y: 0}, 1);  // Bend of 1... this is the final bulge

  // Create a path from four separate paths
  const multiPath = MultiPaths.fromPaths(l3, l4, b1, b2);

  // Make SVG
  const svg = SVG().addTo(svgEl).size(400, 120);
  const bezierSvg = svg.path(multiPath.toSvgString()).attr({fill: 'transparent', margin: '10px', stroke: lineColour});
  const dotSvg = svg.circle(dotDrawOpts.radius * 2).attr({fill: dotDrawOpts.fillStyle});

  // Loop back and forth between 0 and 1
  const progression = pingPongPercent(pingPongInterval);
  let amt = 0;

  const redraw = () => {
    clear(ctx, canvasEl);

    drawHelper.paths(multiPath.segments, {strokeStyle: lineColour});

    // Calc x,y along long at a given amt and draw a dot there
    const dotPos = multiPath.compute(amt);
    drawHelper.dot(dotPos, dotDrawOpts);

    // Move SVG dot. Since position is from top-left corner, we need to adjust
    dotSvg.move(dotPos.x - dotDrawOpts.radius, dotPos.y - dotDrawOpts.radius);
  }

  const update = () => {
    amt = progression.next().value;
  }
  return {redraw, update}
}

// Add the two 'toolboxes' in an array so some operations can be easily repeated
const drawings = [testLine(), testBezier(), testMultiPath()];

// Draw functions gets called repeatedly
const loop = function () {
  drawings.forEach(d => d.redraw());
  drawings.forEach(d => d.update());
  window.requestAnimationFrame(loop);
};
window.requestAnimationFrame(loop);
