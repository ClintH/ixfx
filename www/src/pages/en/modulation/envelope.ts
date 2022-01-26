/* eslint-disable */
import * as Envelopes from '~/modulation/Envelope';
import {button} from '~/dom/Forms';
import {plot2} from '~/visualisation/Plot2';
import {domLog} from '~/dom/DomLog';
import {Palette} from '~/colour/Palette';

const envDataLog = domLog(`#envDataStream`);

const opts: Envelopes.AdsrOpts = {
  attackBend: 1,
  decayBend: -1,
  releaseBend: 1
}
const env = Envelopes.adsr(opts);

env.addEventListener(`change`, ev => {
  button(`#btnRelease`).enable(ev.newState === `sustain`);
});

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
  palette: palette,
  lineWidth: 3
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

