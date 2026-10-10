import * as Rx from '../../../dist/rx.js';

// Demos converting a reactive to a regular async generator

const ptr = Rx.fromEvent(document.body, `pointerup`);

setTimeout(async () => {
  const gen = Rx.toGenerator(ptr);
  try {
    for await (const v of gen) {
      // Values should print out up until reactive is disposed
      console.log(v);
    }
  } catch (e) {
  }
  console.log(`Iteration done`);
});

// Test killing reactive
setTimeout(() => {
  console.log(`Disposing reactive`);
  ptr.dispose(`Test kill`);
}, 5000);
