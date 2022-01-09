/* eslint-disable */
import {MutableFreqHistogram} from '../../src/MutableFreqHistogram';
import {AutoSort, FrequencyHistogramPlot} from '../../src/visualisation/FrequencyHistogramPlot';


const weightedRandom = (min:number, max:number) => {
  return Math.round(max / (Math.random() * max + min));
}

const freq = new MutableFreqHistogram<string>();
const plot = new FrequencyHistogramPlot(document.getElementById('dataPlot'));
plot.sortBy(AutoSort.ValueReverse);
let itemsLeft = 200;

plot.init();
const dataStream = document.getElementById(`dataStream`);

let producerId = 0;
freq.addEventListener(`changed`, () => {
  plot.update(freq.toArray());
});

const createAppendLog = (el:HTMLElement|undefined, truncateEntries:number = 200) => {
  if (el === undefined) return {
    log:(msg:string) => {},
    clear:() => {}
  };

  el.style.overflow = `scroll`;
  let added = 0;
  return {
    log:(msg:string) => {
      const line = document.createElement('div');
      line.innerHTML = msg;
      el.insertBefore(line, el.firstChild);
      
      if (++added > truncateEntries * 2) {
        while (added > truncateEntries) {
          el.lastChild.remove();
          added--;
        }
      }
    },
    clear:() => {
      el.innerHTML = '';
    }
  }
}

const log = createAppendLog(dataStream,4 )
// const log = (msg:string) => {
//   if (dataStream) {
//     dataStream.innerHTML = `${msg}<br />` + dataStream.innerHTML;
//   }
// }

const start = () => {
  log.log(`Start`);
  producerId = window.setInterval(() => {
    itemsLeft--;
    //const r = `something really long ` +  Math.floor(Math.random()*100);// weightedRandom(1, 100);
    const r = weightedRandom(1, 100);
    freq.add(r);
    log.log(r.toString());
    if (itemsLeft <= 0) stop();
  }, 1000);
};

const stop = () => {
  if (producerId === 0) return;
  log.log(`Stop`);
  window.clearInterval(producerId);
}

document.getElementById(`btnStart`).addEventListener(`click`,  start);
document.getElementById(`btnStop`).addEventListener(`click`, stop);
start();

// plot.update([
//   ['apples', 4],
//   ['oranges', 2],
//   ['mangoes', 10],
//   ['kiwi', 1],
//   ['banana', 0],
//   ['tomato', 5]
// ])