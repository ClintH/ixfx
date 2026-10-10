import * as Rx from '../../../dist/rx.js'; 
import * as Data from '../../../dist/data.js';
import* as Dom from '../../../dist/dom.js';
import {Points} from '../../../dist/geometry.js';

const generateRect = () => ({width:window.innerWidth, height:window.innerHeight});

// function testObject() {
//   const o = Rx.fromObject(generateRect());
//   o.on(v => {
//     console.log(`Change: ${JSON.stringify(v)}`);
//   })
//   o.onDiff(diff => {
//     console.log(`Diff: ${JSON.stringify(diff)}`);
//   })
//   setInterval(() => {
//     o.updateField(`width`, Math.random());
//   }, 1000);
//   return o;
// }

const rx = Rx.run(
  Rx.From.event(document, `pointermove`, {x:0,y:0}),
  Rx.Ops.transform(v => ({x:v.x, y:v.y})),
  Rx.Ops.transform(v => Points.divide(v, window.innerWidth, window.innerHeight))
);
rx.onValue(v => {
  console.log(v);
})


// const move = Rx.From.event(document.body, `pointermove`, {x:0,y:0});
// Rx.wrap(move)
//   .tapProcess(
//     value => `${value.x},${value.y}`,
//     Dom.setText(`#lblXy`)
//   );





// const ptr = Rx.From.event(document.body, `pointermove`,{x:0,y:0});
// Rx.Dom.bindText(ptr, document.getElementById(`lblXy`), {transform: v=> {
//   return v.x +','+v.y
// }})

// const clicks = Rx.number(0);
// const btnClicks = Rx.fromEvent(document.getElementById(`btnClick`), `click`);
// Rx.to(btnClicks, clicks, _ => {
//   return clicks.last() + 1
// });
// Rx.Dom.bindText(clicks, `#lblClicks`);

// function testDoubleClickDetection() {
//   const btnClicksChunk = Rx.chunk(btnClicks,{ elapsed: 200});
//   const btnClickSwitch= Rx.switcher( btnClicksChunk, {
//     single: v=> v.length == 1,
//     double: v=> v.length == 2,
//     more: v=>v.length > 2
//   });
//   btnClickSwitch.single.on(msg => {
//     console.log(`single!`);
//   });
//   btnClickSwitch.double.on(msg => {
//     console.log(`double!`);
//   });
// }

// const btnClickCount = Rx.transform(btnClicksChunk, v => ({length:v.length, paths:v.map(event=>event.composedPath())}));
// btnClickCount.on(msg => {
//   console.log(msg.value);
// });

/**
 * Listen for changes in data, manually update accordingly
 */
// function testBindDiffUpdate() {
//   const rxObject = Rx.fromObject({name:`Jane`, ticks:0});
//   const b = Rx.Dom.bindDiffUpdate(rxObject, document.getElementById(`lblObj`),  (diffs, el) => {
//     for (const diff of diffs) {
//       // Only carea about changes to the 'ticks' field
//       if (diff.path !== `ticks`) return;
//       el.textContent = `${diff.previous} -> ${diff.value}`
//     }
//   }, { initial: (v,el)=> {
//     el.innerHTML = `<h1>Hello</h1>`
//   }});
//   setInterval(() => {
//     //rxObject.updateField(`ticks`, Math.floor(Math.random()*1000));
//     rxObject.update({ticks: Math.random()});
//     //rxObject.set({name:`Jane`, ticks: Math.floor(Math.random()*1000)});
//   }, 2000);
// }
// testBindDiffUpdate();