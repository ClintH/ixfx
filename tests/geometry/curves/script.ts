import * as Lines from '../../../src/geometry/line/index.js';
import * as Rects from '../../../src/geometry/rect/index.js';
import * as Beziers from '../../../src/geometry/bezier/index.js';
import * as Drawing from '../../../src/visual/Drawing.js';
import * as Compound from '../../../src/geometry/path/CompoundPath.js';
// /// <reference path="../../public/lib/svg.3.1.1.d.ts"/>
// import * as Svgjs from '../../public/lib/svg.esm';
import { SVG, Svg } from '@svgdotjs/svg.js';
import * as Palette from '../../../src/visual/Palette.js';
import * as Mod from '../../../src/modulation/index.js';

// Drawing properties
const colours = Palette.create();
const bgColour = colours.get(`background-color`);
const lineDrawOptions = { strokeStyle: colours.get(`muted-color`) };
const dotDrawOptions = { radius: 3, fillStyle: colours.get(`primary`) };

const pingPongInterval = 0.01;

const setup = (idPrefix: string, size: Rects.Rect): [ CanvasRenderingContext2D, Svg ] => {
  const canvasElement = document.getElementById(idPrefix + `Canvas`) as HTMLCanvasElement;
  if (canvasElement === undefined) throw new Error(`canvasEl is undefined`);
  canvasElement.width = size.width;
  canvasElement.height = size.height;

  const context = canvasElement.getContext(`2d`)!;          // get drawing context

  // Setup SVG
  const svgElement = document.getElementById(idPrefix + `Svg`)!;
  let svg: Svg = SVG().addTo(svgElement).size(size.width, size.height)!;
  return [ context, svg ];
};

const clear = (context: CanvasRenderingContext2D, bounds: Rects.Rect) => {
  context.save();
  context.resetTransform();
  context.fillStyle = bgColour;

  context.fillRect(0, 0, bounds.width, bounds.height);
  context.restore(); // Restore padding
};

// --- Cubic
const testCubic = () => {
  const bounds = { width: 350, height: 120 };
  const [ context, svg ] = setup(`cubic`, bounds);  // get lineCanvas and lineSvg elements
  const drawHelper = Drawing.makeHelper(context);// make a helper
  context.translate(5, 5); // Shift drawing in a little to avoid being cut off

  // Define bezier's start (A), end (B) and handle (C) points:
  const bezier = Beziers.cubic(
    { x: 5, y: 5 },
    { x: 200, y: 100 },
    { x: 140, y: 20 },
    { x: 50, y: 70 }
  );
  const path = Beziers.toPath(bezier);

  // Use Svg.js to make SVG for the line
  // svg.line(path.toFlatArray()).attr({stroke: lineDrawOpts.strokeStyle});
  // const dotSvg = svg.circle(dotDrawOpts.radius * 2).attr({fill: dotDrawOpts.fillStyle});

  const progression = Mod.pingPongPercent(pingPongInterval); // Loop back and forth between 0 and 1
  let amt = 0;

  const redraw = () => {
    clear(context, bounds); // Clear canvas

    // Draw the line
    drawHelper.bezier(bezier, { ...lineDrawOptions, debug: true });

    // Calc x,y along long at a given amt and draw a dot there
    const dotPos = path.interpolate(amt);
    drawHelper.dot(dotPos, dotDrawOptions);

    // Move SVG dot, need to adjust so it's positioned by its center
    //dotSvg.move(dotPos.x - dotDrawOpts.radius, dotPos.y - dotDrawOpts.radius);
  };

  const update = () => {
    amt = progression.next().value;
  };
  return { redraw, update };
};

// --- Quadratic
const testQuadratic = () => {
  const bounds = { width: 350, height: 120 };

  const [ context, svg ] = setup(`quadratic`, bounds);  // get lineCanvas and lineSvg elements
  const drawHelper = Drawing.makeHelper(context); // make a helper
  context.translate(5, 5); // Shift drawing in a little to avoid being cut off

  // Define bezier's start (A), end (B) and handle (C) points:
  const bezier = Beziers.quadratic({ x: 5, y: 10 }, { x: 330, y: 100 }, { x: 170, y: 20 });
  const path = Beziers.toPath(bezier);


  // Use Svg.js to make SVG for the line
  svg.path(path.toSvgString().join('')).attr({ fill: `transparent`, stroke: lineDrawOptions.strokeStyle });
  //const dotSvg = svg.circle(dotDrawOpts.radius * 2).attr({fill: dotDrawOpts.fillStyle});

  // Loop back and forth between 0 and 1
  const progression = Mod.pingPongPercent(pingPongInterval);
  let amt = 0;

  const redraw = () => {
    clear(context, bounds);

    // Draw bezier
    drawHelper.bezier(bezier, { ...lineDrawOptions, debug: true });

    // Calc x,y along long at a given amt and draw a dot there
    const dotPos = path.interpolate(amt);
    drawHelper.dot(dotPos, dotDrawOptions);

    // Move SVG dot. Since position is from top-left corner, we need to adjust
    //dotSvg.move(dotPos.x - dotDrawOpts.radius, dotPos.y - dotDrawOpts.radius);
  };

  const update = () => {
    amt = progression.next().value;
  };
  return { redraw, update };
};

// --- Path made up of multiple lines & beziers
const testMultiPath = () => {
  const bounds = { width: 400, height: 120 };

  const [ context, svg ] = setup(`multiPath`, bounds); // get lineCanvas and lineSvg elements
  const drawHelper = Drawing.makeHelper(context); // Make a helper
  context.translate(5, 5); // Shift drawing in a little to avoid being cut off

  // Define two lines by their start & end points
  const l3 = Lines.fromPointsToPath({ x: 0, y: 0 }, { x: 100, y: 100 });
  const l4 = Lines.fromPointsToPath({ x: 100, y: 100 }, { x: 200, y: 0 });

  // Define two simple beziers. 
  // A simple bezier has a start, end and 'bend' amount. Bend ranges from -1 to 1.
  const b1 = Beziers.quadraticSimple({ x: 200, y: 0 }, { x: 300, y: 100 }, -1); // Bend of -1... sunken
  const b2 = Beziers.quadraticSimple({ x: 300, y: 100 }, { x: 400, y: 0 }, 1);  // Bend of 1... bulge

  // Create a compound from four separate paths
  const multiPath = Compound.fromPaths(l3, l4, Beziers.toPath(b1), Beziers.toPath(b2));

  // Use Svg.js to make SVG for the line
  svg.path(multiPath.toSvgString().join(` `)).attr({ fill: `transparent`, margin: `10px`, stroke: lineDrawOptions.strokeStyle });
  const dotSvg = svg.circle(dotDrawOptions.radius * 2).attr({ fill: dotDrawOptions.fillStyle });

  // Loop back and forth between 0 and 1
  const progression = Mod.pingPongPercent(pingPongInterval);
  let amt = 0;

  const redraw = () => {
    clear(context, bounds);

    drawHelper.paths(multiPath.segments, lineDrawOptions);

    // Calc x,y along long at a given amt and draw a dot there
    const dotPos = multiPath.interpolate(amt);
    drawHelper.dot(dotPos, dotDrawOptions);

    // Move SVG dot. Since position is from top-left corner, we need to adjust
    dotSvg.move(dotPos.x - dotDrawOptions.radius, dotPos.y - dotDrawOptions.radius);
  };

  const update = () => {
    amt = progression.next().value;
  };
  return { redraw, update };
};

// Throw tests in an array to handle them together
const tests = [ testCubic(), testQuadratic(), testMultiPath() ];

const loop = function () {
  for (const d of tests) d.redraw();
  for (const d of tests) d.update();
  window.requestAnimationFrame(loop);
};
window.requestAnimationFrame(loop);
