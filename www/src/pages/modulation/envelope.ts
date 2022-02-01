/* eslint-disable */
import * as Envelopes from '~/modulation/Envelope';
import {button, checkbox, resolveEl, select} from '~/dom/Forms';
import {plot2} from '~/visualisation/Plot2';
import {domLog} from '~/dom/DomLog';
import {Palette} from '~/colour/Palette';
import {fromEvent, debounceTime} from 'rxjs';
import {map } from  'rxjs/operators';

// Setup data logger
const envDataLog = domLog(`#envDataStream`, {
  minIntervalMs: 20,
  capacity: 150
});

// Setup plot
const palette = new Palette();
palette.add(`scaled`, `yellow`);
palette.add('scaled-axis', 'whitesmoke');

const envData = plot2(`#envData`, {
  capacity: 300,
  showYAxis: true,
  palette: palette,
  lineWidth: 3
});

// Setup envelope
let opts: Envelopes.AdsrOpts = {
  ...Envelopes.defaultAdsrOpts(),
  attackBend: 1,
  decayBend: -1,
  releaseBend: 1
};
let shouldLoop = false;
let env = Envelopes.adsr({...opts, shouldLoop});

env.addEventListener(`change`, ev => {
  button(`#btnRelease`).disabled = ev.newState !== `sustain`;
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

const selectShow = select(`#selectShow`, (val) => {
  envData.clear();
  envDataLog.log()
  startDrawing();
});

// Update playground if envelope is changed
fromEvent(resolveEl(`#envEditor`), `change`)
  .pipe(
    map((v:CustomEvent) => v.detail as Envelopes.AdsrOpts),
    debounceTime(1000))
  .subscribe( v => {
    opts = v;
    console.log('hello')
    updateEnvelope();
});


const updateEnvelope = () => {
  try {
    env = Envelopes.adsr({...opts, shouldLoop});
    env.trigger();
    envDataLog.clear();
    envData.clear();
    startDrawing();
  } catch (err) {
    envDataLog.error(err);
  }
}

checkbox(`#chkLooping`, (newVal) => {
  shouldLoop = newVal;
  updateEnvelope();
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

    // Plot & log data
    const what = selectShow.value === `raw` ? amt : scaled; 
    envData.add(what);
    envDataLog.log(`${stage} ${what.toFixed(3)}`);
    
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


updateEnvelope();