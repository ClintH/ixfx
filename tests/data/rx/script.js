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
const btnClicks = Reactive.event(document.getElementById(`btnClick`), `click`);
Reactive.to(btnClicks, clicks, _ => {
  return clicks.last() + 1
});
Reactive.Dom.bindTextContent(`#lblClicks`, clicks);

//const btnClicksTest = Reactive.batchAndSingle(btnClicks, {elapsed:100, order:(a,b) => a.})
const btnClicksBatch = Reactive.batch({ elapsed: 200})(btnClicks);
// btnClicksBatch.on(msg=> {
//   console.log(msg.value);
// })
//const btnClicksElapsed = Reactive.annotateElapsed(Reactive.event(document.getElementById(`btnClick`), `click`));

const btnClickSwitch= Reactive.switcher(btnClicksBatch, {
  single: v=> v.length == 1,
  double: v=> v.length == 2,
  more: v=>v.length > 2
});
btnClickSwitch.single.on(msg => {
  console.log(`single!`);
});
btnClickSwitch.double.on(msg => {
  console.log(`double!`);
});

const btnClickCount = Reactive.transform(v=> ({length:v.length, paths:v.map(event=>event.composedPath())}));
btnClickCount.on(msg => {
  console.log(msg.value);
})

//Reactive.with(Reactive.event()).transform({}).batch({});

Reactive.pipe(Reactive.event(document,`click`), Reactive.transform({}), Reactive.batch({}))

// setTimeout(() => {
//   btnClicks.dispose(`Test dispose`);
// }, 2000);

// const switcherSource = Reactive.number(0);
// const x = Reactive.switcher(switcherSource, {
//   even: v => v % 2 === 0,
//   odd: v => v % 2 !== 0
// });
// x.even.on(msg => {
//   console.log(`even: ${msg.value}`);
// });
// x.odd.on(msg => {
//   console.log(`odd: ${msg.value}`);
// })
// setInterval(() => {
//   switcherSource.set(switcherSource.last() +1);
// }, 1000);


const rxObject = Reactive.object({name:`Jane`, ticks:0});
const b = Reactive.Dom.bindDiffUpdate(lblObj, rxObject, (diffs, el) => {
  //console.log(diffs);
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