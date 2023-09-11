import { Pipes, Chains } from '../../../dist/data.js';
import * as Flow from '../../../dist/flow.js';
import * as Generators from '../../../dist/generators.js';

const rxWindow = Pipes.rxWindow();
//console.log(`value: ${JSON.stringify(rxWindow.size.value)}`);

rxWindow.size.on(v => {
  console.log(`1 changed: ${JSON.stringify(v)}`);
})

rxWindow.size.on(v => {
  console.log(`2 changed: ${JSON.stringify(v)}`);
})

setTimeout(() => {
  console.log(`Disposing`);
  rxWindow.dispose();
}, 3000);