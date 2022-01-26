/* eslint-disable */
import {MutableFreqHistogram} from '../src/MutableFreqHistogram';
import {domLog} from '../src/dom/DomLog.js';
import {weighted} from '../src/Random.js';
import {FrequencyHistogramPlot} from '../src/visualisation/FrequencyHistogramPlot';

const log = domLog(`dataStream`,{ truncateEntries: 8, timestamp: false });
const freq = new MutableFreqHistogram<string>();
const plot = new FrequencyHistogramPlot(document.getElementById('dataPlot'));
// plot.el.showDataLabels = false;
// plot.el.showXAxis = false;

plot.setAutoSort(`valueReverse`);
let itemsLeft = 200;

plot.init();

let producerId = 0;
freq.addEventListener(`change`, () => {
  plot.update(freq.toArray());
});

const start = () => {
  log.log(`Start`);
  log.log();
  producerId = window.setInterval(() => {
    itemsLeft--;
    //const r = `something really long ` +  Math.floor(Math.random()*100);// weightedRandom(1, 100);
    const r = weighted(1, 100).toString();
    freq.add(r);
    log.log(r.toString());

    if (itemsLeft <= 0) stop();
  }, 1000);
};

const stop = () => {
  if (producerId === 0) return;
  log.log(`Stop`);
  log.log();
  itemsLeft = 200;
  window.clearInterval(producerId);
}

const clear = () => {
  freq.clear();
  log.log();
}

document.getElementById(`btnStart`).addEventListener(`click`,  start);
document.getElementById(`btnStop`).addEventListener(`click`, stop);
document.getElementById(`btnClear`).addEventListener(`click`, clear);
start();

// plot.update([
//   ['apples', 4],
//   ['oranges', 2],
//   ['mangoes', 10],
//   ['kiwi', 1],
//   ['banana', 0],
//   ['tomato', 5]
// ])