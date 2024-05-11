import { Svg, Colour } from '../../../dist/visual.js';
import * as Iterables from '../../../dist/iterables.js';
import * as Dom from '../../../dist/dom.js';
import { Lines, Points } from '../../../dist/geometry.js';
import * as Data from '../../../dist/data.js';
import * as Rx from '../../../dist/rx.js';
import {pingPongPercent} from '../../../dist/numbers.js';
import { Chains } from '../../../dist/iterables.js';

const settings = Object.freeze({
  // Relative middle
  originPoint: { x: 0.5, y: 0.5 },
  strokeWidthMax: 70,
  strokeWidthMin: 3,
  strokeStyle: Colour.getCssVariable(`arc`, `#FACF5A`),
  pingPongInterval: 0.01 
});

// const r1 = Rx.transform(
//   Rx.fromEvent(document.body, `pointermove`), value => {
//     if (!value) return { x: 0.5, y:0.5};
//     return { x:value.x/window.innerWidth, y:value.y/window.innerHeight}
//   });
// r1.value(x => {
//   console.log(x);
// })

const state2 = Data.pull({
  // Loop up and down again from 0 and 100%, 1% at a time
  pingPong: pingPongPercent(settings.pingPongInterval),
  // Keep track of relative mouse coords
  mouse: Rx.transform(
    Rx.fromEvent(document.body, `pointermove`), value => {
      if (!value) return { x: 0.5, y:0.5};
      return { x:value.x/window.innerWidth, y:value.y/window.innerHeight}
  }),
  pointers:{}
});

// let state = Object.freeze({
//   bounds: { width: 0, height: 0, center: { x: 0, y: 0 } },
//   pointers: {},
//   mouse: { x:0, y:0 }
// });


// const updateSvg = () => {
//   const { originPoint } = settings;
//   const { bounds, pingPong, pointers } = state;
//   const svg = document.querySelector(`svg`);

//   if (!svg) return;

//   // Apply same pingPong value to stroke width
//   const strokeWidth = settings.strokeWidthMin + (pingPong * settings.strokeWidthMax);

//   // Calc absolute point of origin according to screen size
//   const originAbs = Points.multiply(originPoint, bounds.width, bounds.height);

//   /** @type {Svg.LineDrawingOpts} */
//   const drawingOptions = {
//     strokeWidth,
//     strokeStyle: settings.strokeStyle,
//     strokeLineCap: `round`
//   };

//   // Delete all existing lines
//   svg.innerHTML = ``;

//   for (const [ id, p ] of Object.entries(pointers)) {
//     // Create line for pointer
//     const line = { a: originAbs, b: p };

//     // Create or update line
//     Svg.Elements.line(line, svg, drawingOptions, `#ray${id}`);
//   }
// };

function setup() {
  // Resize SVG element to match viewport
  Dom.parentSize(`svg`, arguments_ => {
    saveState({
      bounds: windowBounds()
    });
  });

  window.addEventListener(`touchmove`, event => {
    event.preventDefault();
  });

  window.addEventListener(`pointerdown`, event => {
    const { pointers } = state;
    pointers[event.pointerId] = { x: event.offsetX, y: event.offsetY };
    saveState({ pointers });
    event.preventDefault();
  });

  window.addEventListener(`pointerup`, event => {
    const { pointers } = state;
    delete pointers[event.pointerId];
    saveState({ pointers });
    event.preventDefault();
  });

  window.addEventListener(`pointermove`, event => {
    // Moving, but no press/touch
    if (event.buttons === 0) return;
    const { pointers } = state;

    pointers[event.pointerId] = { x: event.offsetX, y: event.offsetY };
    saveState({ pointers });
  });

  const loop = async () => {
    // update();
    // updateSvg();
    const s = await state2.compute();
    console.log(JSON.stringify(s));
    window.setTimeout(loop, 500);
  };
  window.requestAnimationFrame(loop);
};

const windowBounds = () => ({
  width: window.innerWidth,
  height: window.innerHeight,
  center: {
    x: window.innerWidth / 2,
    y: window.innerHeight / 2
  }
});

setup();

/**
 * Update state
 * @param {Partial<state>} s 
 */
function saveState (s) {
  state = Object.freeze({
    ...state,
    ...s
  });
}

