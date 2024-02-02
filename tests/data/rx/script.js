import { Reactive} from '../../../dist/data.js';
import * as Flow from '../../../dist/flow.js';
import { Elapsed } from '../../../dist/flow.js';
import * as Generators from '../../../dist/generators.js';

const generateRect = () => ({width:window.innerWidth, height:window.innerHeight});

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

const ptr = Reactive.event(document.body, `pointermove`);
Reactive.Dom.bindTextContent(lblXy, ptr, {transform: v=> {
  return v.x +','+v.y
}})

const clicks = Reactive.number(0);
clicks.on(msg => {
  console.log(msg);
})
const btnClicks = Reactive.event(btnClick, `click`);
Reactive.to(btnClicks, clicks, _ => {
  return clicks.last() + 1
});
Reactive.Dom.bindTextContent(`#lblClicks`, clicks);

setTimeout(() => {
  btnClicks.dispose(`Test dispose`);
}, 2000);

const rxObject = Reactive.object({name:`Jane`, ticks:0});
const b = Reactive.Dom.bindDiffUpdate(lblObj, rxObject, (diffs, el) => {
  console.log(diffs);
  for (const diff of diffs) {
  if (diff.path !== `ticks`) return;
  el.textContent = `${diff.previous} -> ${diff.value}`
  }
}, { initial: (v,el)=> {
  el.innerHTML = `<h1>Hello</h1>`
}});
setInterval(() => {
  //rxObject.updateField(`ticks`, Math.floor(Math.random()*1000));
  rxObject.update({ticks: Math.random()});
  //rxObject.set({name:`Jane`, ticks: Math.floor(Math.random()*1000)});

}, 2000);


// function testGenerator() {
//   const time = Flow.interval(() => Math.random(), 1000);
//   const r = Reactive.generator(time);
//   console.log(`Pre subscribe`);
//   setTimeout(() => {
//     console.log(`about to subscribe`)
//     r.on(v => {
//       console.log(v.value);
//     })
//   }, 5000); 
// }
// testGenerator();

// function testDispose() {
//   const r = Reactive.number(10);
//   const rEvent = Reactive.event(document, `pointermove`);

//   r.on(v => {
//     console.log(v);
//   });
//   rEvent.on(v => {
//     console.log(v);
//   })
//   setInterval(() => {
//     if (r.isDisposed()) return;
//     r.set(Math.random());
//   }, 1000);

//   setTimeout(() => {
//     r.dispose(`r disposed`);
//     rEvent.dispose(`event dispose`);
//   }, 5000)
// }
// testDispose();