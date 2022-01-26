import * as Lines from '../../src/geometry/Line';
import * as Beziers from '../../src/geometry/Bezier';
import * as Drawing from '../../src/visualisation/Drawing';
import * as Rects from '../../src/geometry/Rect';
import * as Compound from '../../src/geometry/CompoundPath';
// /// <reference path="../../public/lib/svg.3.1.1.d.ts"/>
// import * as Svgjs from '../../public/lib/svg.esm';
import {SVG,Svg} from '@svgdotjs/svg.js';
import {pingPongPercent} from '../../src/Generators';
import * as Palette from '../../src/colour/Palette';

// Drawing properties
const colours = new Palette.Palette();
const bgColour = colours.get(`background-color`);
const lineDrawOpts = {strokeStyle: colours.get(`muted-color`)};
const dotDrawOpts = {radius: 3, fillStyle: colours.get(`primary`)};

const pingPongInterval = 0.01;

const getElements = (idPrefix: string, size:Rects.Rect): [HTMLCanvasElement, Svg|undefined] => {
  const canvasEl = document.getElementById(idPrefix + `Canvas`) as HTMLCanvasElement;
  if (canvasEl === undefined) throw Error(`canvasEl is undefined`);  
  canvasEl.width = size.width;
  canvasEl.height = size.height;

  // Setup SVG
  const svgEl = document.getElementById(idPrefix + `Svg`);
  let svg:Svg|undefined;
  if (svgEl !== null) svg = SVG().addTo(svgEl).size(size.width, size.height);
  return [canvasEl, svg];
};

const clear = (ctx: CanvasRenderingContext2D, canvasEl: HTMLCanvasElement) => {
  ctx.save();
  ctx.resetTransform();
  ctx.fillStyle = bgColour;
  ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
  ctx.restore(); // Restore padding
};

// --- Path made up of multiple lines & beziers
const testCompound = () => {
  const bounds = {width: 400, height: 200};
  const [canvasEl, svg] = getElements(`compound`, bounds); // get lineCanvas and lineSvg elements
  const ctx = canvasEl.getContext(`2d`);          // get drawing context
  const drawHelper = Drawing.makeHelper(ctx); // Make a helper
  ctx.translate(5, 5); // Shift drawing in a little to avoid being cut off

  // Define two lines by their start & end points
  const l3 = Lines.fromPointsToPath({x: 0, y: 0}, {x: 100, y: 100});
  const l4 = Lines.fromPointsToPath({x: 100, y: 100}, {x: 200, y: 0});

  // Define two simple beziers. 
  // A simple bezier has a start, end and 'bend' amount. Bend ranges from -1 to 1.
  const b1 = Beziers.quadraticSimple({x: 200, y: 0}, {x: 300, y: 100}, -1); // Bend of -1... sunken
  const b2 = Beziers.quadraticSimple({x: 300, y: 100}, {x: 400, y: 0}, 1);  // Bend of 1... bulge

  // Create a compound from four separate paths
  const multiPath = Compound.fromPaths(l3, l4, Beziers.toPath(b1), Beziers.toPath(b2));

  // Use Svg.js to make SVG for the line
  svg.path(multiPath.toSvgString()).attr({fill: `transparent`, margin: `10px`, stroke: lineDrawOpts.strokeStyle});
  const dotSvg = svg.circle(dotDrawOpts.radius * 2).attr({fill: dotDrawOpts.fillStyle});

  // Loop back and forth between 0 and 1
  const progression = pingPongPercent(pingPongInterval);
  let amt = 0;

  const redraw = () => {
    clear(ctx, canvasEl);

    drawHelper.paths(multiPath.segments, lineDrawOpts);

    // Calc x,y along long at a given amt and draw a dot there
    const dotPos = multiPath.compute(amt);
    drawHelper.dot(dotPos, dotDrawOpts);

    // Move SVG dot. Since position is from top-left corner, we need to adjust
    dotSvg.move(dotPos.x - dotDrawOpts.radius, dotPos.y - dotDrawOpts.radius);
  };

  const update = () => {
    amt = progression.next().value;
  };
  return {redraw, update};
};

// Throw tests in an array to handle them together
const tests = [testCompound()];

const loop = function () {
  tests.forEach(d => d.redraw());
  tests.forEach(d => d.update());
  window.requestAnimationFrame(loop);
};
window.requestAnimationFrame(loop);
