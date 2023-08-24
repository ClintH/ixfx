import {Lines, Beziers, Rects, Compound} from '../ixfx/geometry.js';
import {Drawing} from '../ixfx/visual.js';
// /// <reference path="../../public/lib/svg.3.1.1.d.ts"/>
// import * as Svgjs from '../../public/lib/svg.esm';
import {SVG, Svg} from '@svgdotjs/svg.js';
import {pingPongPercent} from '../ixfx/generators.js';
import * as Palette from '../ixfx/visual.js';

// Drawing properties
const colours = new Palette.Palette();
const bgColour = colours.get(`background-color`);
const lineDrawOptions = {strokeStyle: colours.get(`muted-color`)};
const dotDrawOptions = {radius: 3, fillStyle: colours.get(`primary`)};

const pingPongInterval = 0.01;

const getElements = (idPrefix: string, size: Rects.Rect): [HTMLCanvasElement, Svg | undefined] => {
  const canvasElement = document.getElementById(idPrefix + `Canvas`) as HTMLCanvasElement;
  if (canvasElement === undefined) throw new Error(`canvasEl is undefined`);
  canvasElement.width = size.width;
  canvasElement.height = size.height;

  // Setup SVG
  const svgElement = document.getElementById(idPrefix + `Svg`);
  let svg: Svg | undefined;
  if (svgElement !== null) svg = SVG().addTo(svgElement).size(size.width, size.height);
  return [canvasElement, svg];
};

const clear = (context: CanvasRenderingContext2D, canvasElement: HTMLCanvasElement) => {
  context.save();
  context.resetTransform();
  context.fillStyle = bgColour;
  context.fillRect(0, 0, canvasElement.width, canvasElement.height);
  context.restore(); // Restore padding
};

// --- Path made up of multiple lines & beziers
const testCompound = () => {
  const bounds = {width: 400, height: 200};
  const [canvasElement, svg] = getElements(`compound`, bounds); // get lineCanvas and lineSvg elements
  const context = canvasElement.getContext(`2d`);          // get drawing context
  const drawHelper = Drawing.makeHelper(context); // Make a helper
  context.translate(5, 5); // Shift drawing in a little to avoid being cut off

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
  svg.path(multiPath.toSvgString()).attr({fill: `transparent`, margin: `10px`, stroke: lineDrawOptions.strokeStyle});
  const dotSvg = svg.circle(dotDrawOptions.radius * 2).attr({fill: dotDrawOptions.fillStyle});

  // Loop back and forth between 0 and 1
  const progression = pingPongPercent(pingPongInterval);
  let amt = 0;

  const redraw = () => {
    clear(context, canvasElement);

    drawHelper.paths(multiPath.segments, lineDrawOptions);

    // Calc x,y along long at a given amt and draw a dot there
    const dotPos = multiPath.compute(amt);
    drawHelper.dot(dotPos, dotDrawOptions);

    // Move SVG dot. Since position is from top-left corner, we need to adjust
    dotSvg.move(dotPos.x - dotDrawOptions.radius, dotPos.y - dotDrawOptions.radius);
  };

  const update = () => {
    amt = progression.next().value;
  };
  return {redraw, update};
};

// Throw tests in an array to handle them together
const tests = [testCompound()];

const loop = function () {
  for (const d of tests) d.redraw();
  for (const d of tests) d.update();
  window.requestAnimationFrame(loop);
};
window.requestAnimationFrame(loop);
