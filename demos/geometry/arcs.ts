import * as Arcs from '../../src/geometry/Arc';
import * as Drawing from '../../src/visualisation/Drawing';
import * as MathUtil from '../../src/geometry/Math';
import {checkbox} from '../../src/dom/Forms';
import {SVG} from '@svgdotjs/svg.js';
import {pingPongPercent} from '../../src/Generators';
import * as Palette from '../../src/colour/Palette';

// Drawing properties
const colours = new Palette.Palette();
const bgColour = colours.get(`background-color`);
const bboxDrawOpts = { strokeStyle: colours.get(`muted-border-color`)};
const dotDrawOpts = {radius: 3, fillStyle: colours.get(`primary`)};
const arcDrawOpts = {strokeStyle: colours.get(`muted-color`)};

const pingPongInterval = 0.01;

// Get reference to canvas and SVG parent DIV
const getElements = (idPrefix: string): [HTMLCanvasElement, HTMLElement] => {
  const canvasEl = document.getElementById(idPrefix + `Canvas`) as HTMLCanvasElement;
  const svgEl = document.getElementById(idPrefix + `Svg`);
  if (canvasEl === undefined) throw Error(`canvasEl is undefined`);
  if (svgEl === null) throw Error(`svgEl is null`);
  return [canvasEl, svgEl];
};

// Clear a canvas
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

  const progression = pingPongPercent(pingPongInterval); // Loop back and forth between 0 and 1
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
  };
  return {redraw, update};
};

// --- Intersection
const testIntersection = () => {
  const [canvasEl, svgEl] = getElements(`intersection`);  // get lineCanvas and lineSvg elements
  const ctx = canvasEl.getContext(`2d`);         // get drawing context
  const drawHelper = Drawing.makeHelper(ctx);// make a helper
  ctx.translate(5, 5); // Shift drawing in a little to avoid being cut off

  const y = 50;
  const radius = 30;

  // Define inner circle
  const circleA = {radius, x: 100, y};
  
  const progression = pingPongPercent(pingPongInterval); // Loop back and forth between 0 and 1
  let amt = 0;

  const bboxEnable = checkbox(`bboxIntersection`);

  const redraw = () => {
    clear(ctx, canvasEl);

    // Move the other circle back and forth
    const circleB = { radius, x: (amt*140)+30, y};

    // Draw circles
    drawHelper.circle([circleA, circleB], arcDrawOpts);

    // Find & draw intersections
    const intersections = Arcs.intersections(circleA, circleB);
    intersections.forEach(i => drawHelper.dot(i, dotDrawOpts));

    if (bboxEnable.checked) {
      // Draw bounding box
      const bbox = Arcs.circleToPath(circleB).bbox();
      drawHelper.rect(bbox, bboxDrawOpts);
    }
  };

  const update = () => {
    amt = progression.next().value;
  };
  return {redraw, update};
};

// --- Contained
const testContained = () => {
  const [canvasEl, svgEl] = getElements(`contained`);  // get lineCanvas and lineSvg elements
  const ctx = canvasEl.getContext(`2d`);         // get drawing context
  const drawHelper = Drawing.makeHelper(ctx);// make a helper
  ctx.translate(5, 5); // Shift drawing in a little to avoid being cut off

  const y = 50;
  const radius = 20;

  // Define outer circle
  const circleLarge = {radius:radius*2, x:100, y};
  
  const progression = pingPongPercent(pingPongInterval); // Loop back and forth between 0 and 1

  let amt = 0;
  const redraw = () => {
    clear(ctx, canvasEl);

    // Draw large circle
    drawHelper.circle(circleLarge, arcDrawOpts);

    // Define inner circle
    const circleSmall = { radius, x: (amt*140)+30, y};
  
    const contained = Arcs.isContainedBy(circleLarge, circleSmall);

    const smallDrawOpts = {...arcDrawOpts};
    if (contained) smallDrawOpts.strokeStyle = dotDrawOpts.fillStyle;
    drawHelper.circle(circleSmall, smallDrawOpts);
  };

  const update = () => {
    amt = progression.next().value;
  };
  return {redraw, update};
};


// --- Arc
const testArc = () => {
  const [canvasEl, svgEl] = getElements(`arc`);  // get lineCanvas and lineSvg elements
  const ctx = canvasEl.getContext(`2d`);         // get drawing context
  const drawHelper = Drawing.makeHelper(ctx);// make a helper
  ctx.translate(5, 5); // Shift drawing in a little to avoid being cut off

  // Arc that grows in and out from start angle
  const startAngle = MathUtil.degreeToRadian(0);
  const startAngleMax = MathUtil.degreeToRadian(180);
  
  // Arc that grows in and out from end angle
  const endAngle = MathUtil.degreeToRadian(100);
  const endAngleMax = MathUtil.degreeToRadian(200);
  
  const bothDistance = MathUtil.degreeToRadian(180);

  const progression = pingPongPercent(pingPongInterval); // Loop back and forth between 0 and 1
  const progression2 = pingPongPercent(0.01);
  let amt = 0;
  let amt2 = 0;
  const y  = 50;
  const bboxEnable = checkbox(`bboxArcs`);

  const drawArcs = (...arcs:Arcs.ArcPositioned[]) => {
    arcs.forEach(arc => {
      drawHelper.arc(arc, arcDrawOpts);

      const path = Arcs.arcToPath(arc);
      const line = Arcs.toLine(arc);

      if (bboxEnable.checked) {
        // Draw bounding box
        const bbox = path.bbox();
        drawHelper.rect(bbox, bboxDrawOpts);
      }

      // Draw start and end
      drawHelper.dot([line.a, line.b], {radius:2, fillStyle: arcDrawOpts.strokeStyle});
    
      // Draw % point
      const r = ((arc.endRadian-arc.startRadian) * amt2) + arc.startRadian;
      drawHelper.dot(Arcs.pointOnArc(arc, r), dotDrawOpts);
    });
  };

  const redraw = () => {
    clear(ctx, canvasEl);    
    // Outer arc has start angle modulated
    const arcStartChanging:Arcs.ArcPositioned = {
      startRadian:amt*startAngleMax + startAngle, 
      endRadian: MathUtil.degreeToRadian(180), 
      radius:40, x: 100, y};

    // Inner arc has end angle modulated
    const arcEndChanging:Arcs.ArcPositioned = {
      startRadian: startAngle, 
      endRadian: endAngleMax*amt + endAngle, 
      radius:30, x: 100, y};

    // Innermost has both modulated
    const bothStart = MathUtil.degreeToRadian(90) + MathUtil.degreeToRadian(180)*amt;

    const arcBothChanging:Arcs.ArcPositioned = {
      startRadian: bothStart, 
      endRadian: bothStart+bothDistance, 
      radius:20, x: 100, y};

    const arcFixed:Arcs.ArcPositioned = {
      startRadian: MathUtil.degreeToRadian(180),
      endRadian: MathUtil.degreeToRadian(360),
      radius: 50,
      x: 100,
      y
    };

    drawArcs(arcStartChanging, arcEndChanging, arcBothChanging, arcFixed);
  };

  const update = () => {
    amt = progression.next().value;
    amt2 =progression2.next().value;
  };
  return {redraw, update};
};

// Throw tests in an array to handle them together
const tests = [testCircle(), testIntersection(), testContained(), testArc()];

const loop = function () {
  tests.forEach(d => d.redraw());
  tests.forEach(d => d.update());
  window.requestAnimationFrame(loop);
};
window.requestAnimationFrame(loop);
