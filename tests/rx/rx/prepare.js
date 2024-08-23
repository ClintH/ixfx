import * as Rx from '../../../dist/rx.js';
import * as Flow from '../../../dist/flow.js';
import { Elapsed } from '../../../dist/flow.js';
import * as Iterables from '../../../dist/iterables.js';
const width = Rx.number(10);

const rxWindow = Rx.win();
const size = Rx.transform(rxWindow.size, (size) => size.width*size.height);

const pointer = Rx.event(window, `pointermove`, {
  process:(event) => {
    if (event === undefined) return 0;
    return {x:event.x, y:event.y}
  }
});

size.on(size => console.log(size));

const test = {
  rectangle: {
    width: width,
    height: 20,
    left: Rx.field(pointer,`x`),
    top: Rx.field(pointer, `y`)
  }
}

const x = Rx.prepare(test);
console.log(x);
x.on(v => {
  console.log(`New rectangle: ${JSON.stringify(x)}`);
})

setInterval(() => {
  width.set(Math.random());
},1000);

function testNumber() {
  const x = Rx.number(10);
  //console.log(x.last());
  //x.on(v => console.log(`Value: ${v}`));

  // Update x quite fast
  setInterval(() => x.set(Math.random()), 100); 

  // const chunked = Rx.chunk(x, { elapsed: 1000 });
  // chunked.on(data => {
  //   console.log(data);
  // })

  const throttle = Rx.throttle(x, { elapsed: 1000 });
  throttle.on(data=>{
    console.log(data);
  })
}

const rx = Rx.win();
rx.pointer.on(v => {
  console.log(v);
})