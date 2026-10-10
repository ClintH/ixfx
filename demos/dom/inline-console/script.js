import { inlineConsole } from '../../../dist/dom.js';

inlineConsole();
console.log(`Hello`);
setInterval(() => {
  console.log(Math.random());
  if (Math.random() > 0.5) throw new Error(`eek`);
  console.log(`Hello`, { name: `John`});
}, 500);