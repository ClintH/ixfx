import * as Arcs from '../../src/geometry/Arc';
import * as Drawing from '../../src/visualisation/Drawing';

import {SVG} from '@svgdotjs/svg.js';
import {pingPongPercent} from '../../src/Producers';

// Drawing properties

const bgColour = `#edf0f3`;
const pingPongInterval = 0.001;
const dotDrawOpts = {radius: 3, fillStyle: `#f516d0`};
const arcDrawOpts = {strokeStyle: `#11191f`}

const getElements = (idPrefix: string): [HTMLCanvasElement, HTMLElement] => {
  const canvasEl = document.getElementById(idPrefix + `Canvas`) as HTMLCanvasElement;
  const svgEl = document.getElementById(idPrefix + `Svg`);
  if (canvasEl === undefined) throw Error(`canvasEl is undefined`);
  if (svgEl === null) throw Error(`svgEl is null`);
  return [canvasEl, svgEl];
};

const clear = (ctx: CanvasRenderingContext2D, canvasEl: HTMLCanvasElement) => {
  ctx.save();
  ctx.resetTransform();
  ctx.fillStyle = bgColour;
  ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
  ctx.restore(); // Restore padding
};

// --- Circle
const testCircle = () => {
  const [canvasEl, svgEl] = getElements(`line`);  // get lineCanvas and lineSvg elements
  const ctx = canvasEl.getContext(`2d`);         // get drawing context
  const drawHelper = Drawing.makeHelper(ctx);// make a helper
  ctx.translate(5, 5); // Shift drawing in a little to avoid being cut off

  // Define circle of 100px radius, with a center at 100,100
  const circle = {radius: 100, x: 100, y: 100};
  const circlePath = Arcs.circleToPath(circle);

  // Loop back and forth between 0 and 1
  const progression = pingPongPercent(pingPongInterval);
  let amt = 0;

  const redraw = () => {
    clear(ctx, canvasEl);

    // Draw the circle
    drawHelper.circle(circle, arcDrawOpts);

    // Calc x,y along long at a given amt and draw a dot there
    const dotPos = circlePath.compute(amt);
    drawHelper.dot(dotPos, dotDrawOpts);

  };

  const update = () => {
    amt = progression.next().value;
    console.log(amt);
  };
  return {redraw, update};
};


// Throw tests in an array to handle them together
const tests = [testCircle()];

const loop = function () {
  tests.forEach(d => d.redraw());
  tests.forEach(d => d.update());
  window.requestAnimationFrame(loop);
};
window.requestAnimationFrame(loop);
