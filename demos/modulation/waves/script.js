import {sleep} from '../../../dist/flow.js';
import * as Dom from '../../../dist/dom.js';
import * as Data from '../../../dist/data.js';

import { count } from '../../../dist/numbers.js'
import {Plot2} from '../../../dist/visual.js';
import {interpolate} from '../../../dist/numbers.js';
import * as Mod from '../../../dist/modulation.js';

const names = [...Mod.Easings.getEasingNames()];
console.log(names);

// const tt = Mod.Sources.ticks(10);
// while (true) {
//   console.log(tt());
//   await sleep(100);
// }

const p1 = new Plot2.Plot(`#plot1`);
const p2 = new Plot2.Plot(`#plot2`);

const base = {
  period:1,
  millis:3000,
  oneShot:false
}
const t1b = Mod.Sources.elapsed(base.millis);

const sine = Mod.wave({...base, shape:`sine`,cycleLimit:1 });
//const sineDouble = Mod.wave({...base, shape:`sine`, period:4});
const saw = Mod.wave({millis:10_000,shape:`saw`, cycleLimit:1});
// const sineMerged = () => {
//   return interpolate(saw(), sine(), sineDouble());
// }

const sineI = Mod.wave({...base, shape:`sine`, invert:true});
const square = Mod.wave({...base, shape:`square`});
const triangle = Mod.wave({...base, shape:`triangle`});
const arc = Mod.wave({...base, shape:`arc`});

while (true) {
 // const valueSquare = square();
  const valueSine = sine();
  
  //const valueSineDouble = sineDouble();
  // const valueTri = triangle();
  // const valueArc = arc();
  //const valueSineMerged = sineMerged();

  p1.plot({sine:valueSine});
  const v2 = t1b();
  //p2.plot({x:valueSineMerged});

  await sleep(10);
}