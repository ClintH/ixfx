import * as Rx from '../../../dist/rx.js';
import * as Flow from '../../../dist/flow.js';
import { Elapsed } from '../../../dist/flow.js';
import * as Generators from '../../../dist/numbers.js';
import {Chains} from '../../../dist/iterables.js';
import * as Iterables from '../../../dist/iterables.js';

const testRun = async () => {
  console.log(`testRun`);
  const c1 = Chains.run(
    Chains.From.event(window, `pointermove`),
    Chains.Links.transform(event => ({x:event.x,y:event.y}))
  );


  for await (const v of c1) {    
    console.log(v);
  }
  console.log(`After foreach`);
  const v = await Chains.asPromise(c1);

}


const chain = Chains.prepare(
 Chains.Links.transform( v => Number.parseInt(v) ),
 Chains.Links.filter(v => v % 2 === 0)
);

const read = chain(Chains.From.array([1,2,3],100));
for await (const v of read) {
  console.log(`v: ${v}`);
}

const read2 = chain(Chains.From.array([4,5,6],100));
for await (const v of read2) {
  console.log(`v2: ${v}`);
}

Chains.Links.average
