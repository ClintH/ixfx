import * as Dom from '../../../dist/dom.js';
import { Waypoints, Points, Lines, Paths } from '../../../dist/geometry.js';
import { Arrays } from '../../../dist/collections.js';

// Define settings - properties that don't change
const settings = Object.freeze({
  tickLoopMs: 10,
  /**
   * List of waypoints to use
   * @type {Points.Point[]}
   */
  waypoints: [
    { x:0.1, y:0.1 },
    { x:0.3, y:0.3 },
    { x:0.5, y:0.4 }
  ]
});

// Initial state - properties that change as code runs
let state = Object.freeze({
  /**
   * @type {CanvasRenderingContext2D}
   */
  ctx:undefined,
  waypointTracker: Waypoints.fromPoints(settings.waypoints),
  bounds: {
    width: 0,
    height: 0,
    center: { x: 0, y: 0 },
  },
  /** 
   * Current relative pointer position
   * @type {Points.Point} */
  pointer: { x: 0, y:0 },
  /** @type number */
  scaleBy: 1,
  /**
   * @type {{path:Paths.Path, nearest:Points.Point, distance:number}[]}
   */
  progresses: []
});

const relToAbs = (point) => Points.multiply(point, state.scaleBy,state.scaleBy);
const absToRel = (point) => Points.divide(point, state.scaleBy,state.scaleBy);

const tick = () => {
  const { pointer, waypointTracker } = state;

  const  r = waypointTracker(pointer);

  // // Calculate progress of pointer between all the waypoint lines
  // const progresses = waypointLines.map((line,index) => (
  //   { 
  //     index, 
  //     score: Points.progressBetween(pointer, line.a, line.b)
  //   })
  // );
  
  // const sorted = Arrays.sortByNumericProperty(progresses, `score`);

  updateState({
    progresses: r
  });
};

/**
 * This is run at animation speed. It
 * should just draw based on whatever is in state
 * @returns 
 */
const drawState = () => {
  const { waypoints } = settings;
  const {  progresses, ctx } = state;

  /** @type HTMLCanvasElement|null */
  // const canvasEl = document.querySelector(`#canvas`);
  // const ctx = canvasEl?.getContext(`2d`);
  // if (!ctx || !canvasEl) return;

  // Clear canvas
  clear(ctx);

  // Draw lines between wayoints
  ctx.fillStyle = `white`;
  ctx.strokeStyle = `silver`;

  const corner1 = {x:0, y:0};
  const corner2 = {x:1, y:1};

  drawLine(ctx, corner1, corner2);

  // waypointLines.forEach((line, index) => {
  //   const p = progresses.find(p=>p.index === index);
  //   drawLabelledLine(ctx, line, `Pair ${index} Progress: ${p?.score.toFixed(2) ?? ``}`);
  // });

  for (const wpt of progresses) {
    let title = wpt.distance.toFixed(2);
    title = `Index: ${wpt.index} ${title}`
    drawLabelledPoint(ctx, wpt.nearest, `white`, title);
  };

  // Draw waypoints
  waypoints.forEach((wp, index) => {

    drawLabelledPoint(ctx, wp, `yellow`, index.toString());
  });
};

const drawLine = (ctx, a, b) => {
  a = relToAbs(a);
  b = relToAbs(b);
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.strokeStyle = `white`;
  ctx.stroke();

}

/**
 * Draws a labelled line
 * @param {CanvasRenderingContext2D} ctx 
 * @param {Lines.Line} line
 * @param {string} [title] 
 */
const drawLabelledLine = (ctx, line, title) => {
  const a = relToAbs(line.a);
  const b = relToAbs(line.b);

  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
  ctx.closePath();

  if (title) {
    const mid = Lines.midpoint(a, b);
    ctx.fillText(title, mid.x + 10, mid.y);
  }
};
/**
 * Clears canvas
 * @param {CanvasRenderingContext2D} ctx 
 */
const clear = (ctx) => {
  const { width, height } = state.bounds;

  // Make background transparent
  ctx.clearRect(0, 0, width, height);

  // Clear with a colour
  //ctx.fillStyle = `orange`;
  //ctx.fillRect(0, 0, width, height);

  // Fade out previously painted pixels
  //ctx.fillStyle = `hsl(200, 100%, 50%, 0.1%)`;
  //ctx.fillRect(0, 0, width, height);
};

const onPointerMove = (evt) => {
  updateState({ pointer: absToRel(evt) });
};

/**
 * Setup and run main loop 
 */
const setup = () => {
  const { tickLoopMs } = settings;

  Dom.fullSizeCanvas(`#canvas`, args => {
    // Update state with new size of canvas
    updateState({ 
      bounds: args.bounds,
      ctx: args.ctx,
      scaleBy: Math.min(args.bounds.width, args.bounds.height)
    });
  });

  // Call `tick` at a given rate
  const tickLoop = () => {
    tick();
    setTimeout(tickLoop, tickLoopMs);
  };
  tickLoop();

  // Animation loop
  const animationLoop = () => {
    drawState();
    window.requestAnimationFrame(animationLoop);
  };
  animationLoop();

  document.addEventListener(`pointermove`, onPointerMove);
};
setup();

/**
 * Update state
 * @param {Partial<state>} s 
 */
function updateState (s) {
  state = Object.freeze({
    ...state,
    ...s
  });
}


/**
 * Draws a relative point with optional text
 * @param {CanvasRenderingContext2D} ctx 
 * @param {{x:number, y:number}} point 
 */
function drawLabelledPoint(ctx, point, fillStyle = `black`, msg = ``, textFillStyle = `white`)  {

  const radius = 5;

  // Convert x,y to absolute point
  const abs = relToAbs(point);

  // Translate so 0,0 is the center of circle
  ctx.save();
  ctx.translate(abs.x, abs.y);
  
  // Fill a circle
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = fillStyle;
  ctx.fill();

  if (msg.length) {
    ctx.fillStyle = textFillStyle;
    ctx.textAlign = `center`;
    ctx.fillText(msg, radius * 2, radius * 2);
  }
  ctx.restore();
}
