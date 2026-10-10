import {noiseFilter } from '../../../dist/bundle.js';
import {Oscillators, jitter} from '../../../dist/modulation.js';
import {frequencyTimer} from '../../../dist/flow.js';

import {PlotOld} from '../../../dist/visual.js';

const sine = Oscillators.sine(frequencyTimer(10));
const jitterer = jitter({relative: 0.2});

let x = 0;
const f = noiseFilter(0.001, 0.005)
const plotSize = {
  width: 500,
  height: 200
};


const plotRaw = PlotOld.plot(`#plotRaw`, { 
  plotSize,
  seriesColours: {
    raw: `red`,
    smoothed: `white`
  },
  showLegend: true
 });
const plotFiltered = PlotOld.plot(`#plotFiltered`, { plotSize});

setInterval(() => {
  const v = sine.next().value;
  const j =jitterer(v);
  plotRaw.add(j, `raw`);

  const smoothed = f(j);
  
  plotRaw.add(smoothed,`smoothed`);
}, 10);

document.addEventListener(`pointermove`, event => {
  x = event.clientX / window.innerWidth;
})