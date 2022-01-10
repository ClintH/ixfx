import * as Lines from '../../src/geometry/Line';
import * as Drawing from '../../src/visualisation/Drawing';
import * as Compound from '../../src/geometry/CompoundPath';
import * as Points from '../../src/geometry/Point';
import {SVG, Svg} from '@svgdotjs/svg.js';
import {pingPongPercent} from '../../src/Producers';
import * as Palette from '../../src/colour/Palette';
import {dom} from '../../src/dom/EventResponsive';
import {checkbox} from '../../src/dom/Forms';
import {Rects} from '../../src';

// Drawing properties
const colours = new Palette.Palette();
const bgColour = colours.get(`background-color`);
const lineDrawOpts = {strokeStyle: colours.get(`muted-color`)};
const bboxDrawOpts = { strokeStyle: colours.get(`muted-border-color`)};
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

// --- Line
const testLine = () => {
  const [canvasEl, svg] = getElements(`line`, {width:350, height: 120});  // get lineCanvas and lineSvg elements
  const ctx = canvasEl.getContext(`2d`);         // get drawing context
  const drawHelper = Drawing.makeHelper(ctx);// make a helper
  ctx.translate(5, 5); // Shift drawing in a little to avoid being cut off

  // Define line by start & end points
  const line = Lines.fromPointsToPath({x: 0, y: 0}, {x: 350, y: 120});
 
  svg.line(line.toFlatArray()).attr({stroke: lineDrawOpts.strokeStyle});
  const dotSvg = svg.circle(dotDrawOpts.radius * 2).attr({fill: dotDrawOpts.fillStyle});

  // Loop back and forth between 0 and 1
  const progression = pingPongPercent(pingPongInterval);
  let amt = 0;

  const redraw = () => {
    clear(ctx, canvasEl);

    // Draw the line
    drawHelper.line(line, lineDrawOpts);

    // Calc x,y along long at a given amt and draw a dot there
    const dotPos = line.compute(amt);
    drawHelper.dot(dotPos, dotDrawOpts);

    // Move SVG dot, need to adjust so it's positioned by its center
    dotSvg.move(dotPos.x - dotDrawOpts.radius, dotPos.y - dotDrawOpts.radius);
  };

  const update = () => {
    amt = progression.next().value;
  };
  return {redraw, update};
};

// --- Line functions
const testDistances = () => {
  const bounds = {x:0, y:0, width:400, height: 330};
  const [canvasEl] = getElements(`distances`, bounds);  // get lineCanvas and lineSvg elements
  const ctx = canvasEl.getContext(`2d`);         // get drawing context
  const drawHelper = Drawing.makeHelper(ctx);// make a helper
 
  const line = Lines.fromPointsToPath({x: 30, y: 300}, {x: 350, y:30});
 
  // Keep track of pointer
  const pointerPos = dom({
    object: canvasEl, 
    eventName:`pointermove`,
    transform:(evt:PointerEvent) => ({x: evt.offsetX, y:evt.offsetY}),
  }).value;
  const bboxEnable = checkbox(`bboxDistances`);
  
  const redraw = () => {
    clear(ctx, canvasEl);

    if (bboxEnable.checked) {
      const bbox = Lines.bbox(line);
      drawHelper.rect(bbox, bboxDrawOpts);
    }

    // Draw the line
    drawHelper.line(line, lineDrawOpts);

    if (!pointerPos.x && !pointerPos.y) return; // Don't have a pointer position

    // Calc & draw nearest point on line
    const nearest = Lines.nearest(line, pointerPos);
    drawHelper.dot(nearest, dotDrawOpts);

    // True if pointer is within 20px of line
    const withinRange = Lines.withinRange(line, pointerPos, 20);
    
    // Calc & draw distance from pointer to any place on line
    const distance = Lines.distance(line, pointerPos);
    drawHelper.textBlock([`Distance: ${Math.floor(distance)}`], {
      anchor: pointerPos,
      bounds: bounds,
      anchorPadding: 5,
      fillStyle: lineDrawOpts.strokeStyle
    });

    // Draw pointer
    const pointerDot = withinRange ? `yellow` : `white`;
    drawHelper.dot(pointerPos, {...dotDrawOpts, fillStyle:pointerDot});
    
  };

  // No-op
  const update = () => { /* noop */ };
  return {redraw, update};
};


// --- Compound
const testCompound = () => {
  const [canvasEl, svg] = getElements(`compound`, {width:170, height: 160});
  const ctx = canvasEl.getContext(`2d`);         // get drawing context
  const drawHelper = Drawing.makeHelper(ctx);// make a helper
  ctx.translate(5, 5); // Shift drawing in a little to avoid being cut off

  const points = Points.fromNumbers([150, 0], [0, 100], [100, 150], [150, 50], [10, 30]);
  const paths = Lines.joinPointsToLines(...points).map(l => Lines.toPath(l));
  const compound = Compound.fromPaths(...paths);

  svg.path(compound.toSvgString()).attr({fill: `transparent`, margin: `10px`, stroke: lineDrawOpts.strokeStyle});

  const dotSvg = svg.circle(dotDrawOpts.radius * 2).attr({fill: dotDrawOpts.fillStyle});

  // Loop back and forth between 0 and 1
  const progression = pingPongPercent(pingPongInterval);
  let amt = 0;
  const bboxEnable = checkbox(`bboxCompound`);

  const redraw = () => {
    clear(ctx, canvasEl);

    if (bboxEnable.checked) {
      const bbox = compound.bbox();
      drawHelper.rect(bbox, bboxDrawOpts);
    }

    // Draw the line
    drawHelper.paths(compound.segments, lineDrawOpts);

    // Calc x,y along long at a given amt and draw a dot there
    const dotPos = compound.compute(amt);
    drawHelper.dot(dotPos, dotDrawOpts);

    // Move SVG dot, need to adjust so it's positioned by its center
    dotSvg.move(dotPos.x - dotDrawOpts.radius, dotPos.y - dotDrawOpts.radius);
  };

  const update = () => {
    amt = progression.next().value;
  };
  return {redraw, update};
};
// Throw tests in an array to handle them together
const tests = [testLine(), testDistances(), testCompound()];

const loop = function () {
  tests.forEach(d => d.redraw());
  tests.forEach(d => d.update());
  window.requestAnimationFrame(loop);
};
window.requestAnimationFrame(loop);
