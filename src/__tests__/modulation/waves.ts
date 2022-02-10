import {saw} from '../../modulation/Oscillator.js';
import {frequencyTimer} from '../../Timer.js';

const t = frequencyTimer(1000);
console.log(`Cycle`);
// let loops = 10;
// const tt = t();
// while (loops > 0) {
//   const v = Math.round(tt.elapsed * 100);
//   console.log(`${loops} - ${v}`);
//   loops--;
// }

const s = saw(t);

console.log(`Waves`);
//eslint-disable-next-line functional/no-let
let loops = 5;
//eslint-disable-next-line functional/no-loop-statement
while (loops > 0) {
  const v = s.next().value;
  console.log(`${loops}: ${v}`);
  loops--;
}
console.log(`Done.`);