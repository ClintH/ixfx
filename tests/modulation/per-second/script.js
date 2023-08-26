import {perSecond} from '../../../dist/modulation.js';
import * as Dom from '../../../dist/dom.js';
import {Elapsed} from '../../../dist/flow.js';

const v = perSecond(0.1);

const elapsed = Elapsed.since();
let accumulated = 0;
setInterval(() => {
  let value = v();
  accumulated += value;
  console.log(`elapsed: ${elapsed()} value: ${value} accumulated: ${accumulated}`);
}, 100);