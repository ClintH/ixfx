import {Series} from "./Series.js";
import * as Filters from "./Filters.js";
import * as Producers from "./Producers.js";

type NumberToTrigger = (v: number) => boolean;
type TriggerToTrigger = (trigger: boolean) => boolean;

const createProbability = (probability: number): NumberToTrigger | TriggerToTrigger => {
  return (v: number | boolean): boolean => {
    const rando = Math.random();
    return (rando <= probability)
  }
}

// const delay = (timeMs: number): TriggerToTrigger => {
//   let p = new Promise<boolean>((resolve, reject) => {
//     setTimeout(() => {
//       resolve(true);
//     }, timeMs);
//   });
//   return p;
// }

const produceWithInterval = <V>(intervalMs: number, produce: () => V): Series<V> => {
  let series = new Series<V>();
  let timer = setInterval(() => {
    if (series.cancelled) {
      clearInterval(timer);
      return;
    }
    series.push(produce());
  }, intervalMs);
  return series;
}




console.log('Start');
let s = produceWithInterval(500, () => Math.random());
setTimeout(() => {
  console.log('Killing');
  s.cancel();
}, 5000);

let f = Filters.threshold(0.5);
let f2 = Filters.rangeInclusive(0.7, 1);




// for await (let n of s) {
//   //filterChain.reduceRight()
//   if (!chain(n)) console.log(' X ' + n);
//   else console.log(n);
// }

