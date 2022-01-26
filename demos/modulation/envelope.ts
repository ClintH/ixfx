/* eslint-disable */
import * as Envelopes from '../../src/modulation/Envelope.js';
import {button} from '../../src/dom/Forms.js';
import {plot2} from '../../src/visualisation/Plot2.js';
import {domLog} from '../../src/dom/DomLog.js';
import {Palette} from '../../src/colour/Palette.js';


// const randomGenerator = atInterval<number>(async () => Math.random(), 1000);
// let iterations = 0;
// for await (const r of randomGenerator) {
//   console.log(r);
//   if (++iterations >= 20) break;
// }

// console.log(`Before delay`);
// const result = await delay(async () => Math.random(), 1000);
// console.log(result); // Prints out result after one second

const envDataLog = domLog(`envDataStream`);

const opts:Envelopes.AdsrOpts = {
  attackBend: 1,
  decayBend: -1,
  releaseBend: 1
}
const env = Envelopes.adsr(opts);

env.addEventListener(`change`, ev => {
  button(`#btnRelease`).enable(ev.newState === `sustain`);
});
// type EventSource = {
//   addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
//   removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
// }

// const domEventTrigger = async function*(elementId:string, event:string) {
//   const el = document.getElementById(elementId);
//   if (el === null) {
//     console.warn(`domEventTrigger element with id ${elementId} not found`);
//     return;
//   }
//   el.addEventListener(event, () => {
//     yield 
//   });
// }


button(`#btnTriggerHold`, () => {
  envDataLog.clear();
  env.trigger(true);
  startDrawing();
});
button(`#btnRelease`, () => {
  env.release();
});
button(`#btnTrigger`, () => {
  envDataLog.clear();
  env.trigger();
  startDrawing();
});

const palette = new Palette();
palette.add(`scaled`, `yellow`);
palette.add('scaled-axis', 'whitesmoke');

//const envData =  new Plot(document.getElementById(`envData`) as HTMLCanvasElement, 500);
const envData = plot2(`#envData`, {
  capacity: 300,
  showYAxis: true,
  yAxes: 'scaled',
  palette: palette
});

let isDrawing = false;

const startDrawing = () => {
  if (isDrawing) return;
  const draw = function () {
    let [stage, scaled, amt] = env.compute();
    if (stage === undefined) {
      isDrawing = false;
      return;
    }

    // Plot data
    envData.add(amt, `amt`, true);
    envData.add(scaled, `scaled`);
    // Log numeric
    envDataLog.log(`${stage} scaled: ${scaled.toFixed(3)} raw: ${amt.toFixed(3)}`);
    

    if (!env.isDone) {
      isDrawing = true;
      window.requestAnimationFrame(draw);
    } else {
      console.log(`Envelope done`);
      isDrawing = false;
    }
  }
  window.requestAnimationFrame(draw);
}

