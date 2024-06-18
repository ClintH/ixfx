
// const resize = Pipez.fromEvent(window, `resize`);
// const size = Pipez.generateValueSync(() => ({ width: window.innerWidth, height: window.innerHeight }));
// const tick = Pipez.fromAsyncGenerator(Chains.tick({interval:500, loops:10})());

// const x = await Pipez.chainSync(
//   tick,
//    size
//    );

// x.onValue(v => {
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
// rxWindow.size.onValue(v => {
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