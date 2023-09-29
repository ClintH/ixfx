import { Reactive} from '../../../dist/data.js';
import * as Flow from '../../../dist/flow.js';
import { Elapsed } from '../../../dist/flow.js';
import * as Generators from '../../../dist/generators.js';

const generateRect = () => ({width:window.innerWidth, height:window.innerHeight});
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

// setInterval(() => {
//   width.set(Math.random());
// },1000);

// function testNumber() {
//   const x = Reactive.number(10);
//   //console.log(x.last());
//   //x.on(v => console.log(`Value: ${v}`));

//   // Update x quite fast
//   setInterval(() => x.set(Math.random()), 100); 

//   // const batched = Reactive.batch(x, { elapsed: 1000 });
//   // batched.on(data => {
//   //   console.log(data);
//   // })

//   const throttle = Reactive.throttle(x, { elapsed: 1000 });
//   throttle.on(data=>{
//     console.log(data);
//   })
// }

// const rx = Reactive.win();
// rx.pointer.on(v => {
//   console.log(v);
// })

function testObject() {
  const o = Reactive.object(generateRect());
  o.on(v => {
    console.log(`Change: ${JSON.stringify(v)}`);
  })
  o.onDiff(diff => {
    console.log(`Diff: ${JSON.stringify(diff)}`);
  })
  setInterval(() => {
    //o.set(generateRect());
    //o.update({x:Math.random()});
    o.updateField(`width`, Math.random());
  }, 1000);
}


// const resize = Pipez.fromEvent(window, `resize`);
// const size = Pipez.generateValueSync(() => ({ width: window.innerWidth, height: window.innerHeight }));
// const tick = Pipez.fromAsyncGenerator(Chains.tick({interval:500, loops:10})());

// const x = await Pipez.chainSync(
//   tick,
//    size
//    );

// x.value(v => {
//   console.log(v);
// });
// const value = x.lastValue();

// console.log(`current: ${value.width} x ${value.height}`);

// setTimeout(() => {
//   x.dispose(`disposing`);
// }, 5000);



// function testObject(){
//   const v = Pipes.object({position:{x:10,y:20}});
//   v.onMessage(msg => {
//     console.log(`message`, msg);
//   });
//   v.onChange(value => {
//     console.log(`value`,value);
//   });

//   setInterval(() => {
//     //v.set({position:{x:Math.random(), y:20}});
//     v.setPath(`position.x`,Math.random());
//   }, 1000)
// }

// const rxWindow = Pipes.rxWindow();
// rxWindow.size.on.value(v => {
//   console.log(v);
// })


// const rxWindow = Pipes.rxWindow();
// //console.log(`value: ${JSON.stringify(rxWindow.size.value)}`);

// rxWindow.size.on(v => {
//   console.log(`1 changed: ${JSON.stringify(v)}`);
// })

// rxWindow.size.on(v => {
//   console.log(`2 changed: ${JSON.stringify(v)}`);
// })

// setTimeout(() => {
//   console.log(`Disposing`);
//   rxWindow.dispose();
// }, 3000);