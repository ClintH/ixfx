import * as Rx from '../../../dist/rx.js';
import * as Arrays from '../../../dist/arrays.js';

const v = Rx.From.domValueAsNumber(`#slider`, 
{
  when:`progress`, 
  makeRelative: true
});
v.onValue(value => {
  console.log(`value: ${value} type: ${typeof value}`);
})