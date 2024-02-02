import { Reactive} from '../../../dist/data.js';
import * as Flow from '../../../dist/flow.js';
import { Elapsed } from '../../../dist/flow.js';
import * as Generators from '../../../dist/generators.js';
const width = Reactive.number(10);

const rxWindow = Reactive.win();
const size = Reactive.transform(rxWindow.size, (size) => size.width*size.height);

const pointer = Reactive.event(window, `pointermove`, {
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
    left: Reactive.field(pointer,`x`),
    top: Reactive.field(pointer, `y`)
  }
}

const x = Reactive.prepare(test);
console.log(x);
x.on(v => {
  console.log(`New rectangle: ${JSON.stringify(x)}`);
})

setInterval(() => {
  width.set(Math.random());
},1000);

function testNumber() {
  const x = Reactive.number(10);
  //console.log(x.last());
  //x.on(v => console.log(`Value: ${v}`));

  // Update x quite fast
  setInterval(() => x.set(Math.random()), 100); 

  // const batched = Reactive.batch(x, { elapsed: 1000 });
  // batched.on(data => {
  //   console.log(data);
  // })

  const throttle = Reactive.throttle(x, { elapsed: 1000 });
  throttle.on(data=>{
    console.log(data);
  })
}

const rx = Reactive.win();
rx.pointer.on(v => {
  console.log(v);
})