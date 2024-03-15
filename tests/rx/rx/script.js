import * as Rx from '../../../dist/rx.js';

const generateRect = () => ({width:window.innerWidth, height:window.innerHeight});

function testObject() {
  const o = Rx.fromObject(generateRect());
  o.on(v => {
    console.log(`Change: ${JSON.stringify(v)}`);
  })
  o.onDiff(diff => {
    console.log(`Diff: ${JSON.stringify(diff)}`);
  })
  setInterval(() => {
    o.updateField(`width`, Math.random());
  }, 1000);
  return o;
}

const ptr = Rx.fromEvent(document.body, `pointermove`);
Rx.Dom.bindText(ptr, document.getElementById(`lblXy`), {transform: v=> {
  return v.x +','+v.y
}})

const clicks = Rx.number(0);
const btnClicks = Rx.fromEvent(document.getElementById(`btnClick`), `click`);
Rx.to(btnClicks, clicks, _ => {
  return clicks.last() + 1
});
Rx.Dom.bindText(clicks, `#lblClicks`);

function testDoubleClickDetection() {
  const btnClicksBatch = Rx.batch(btnClicks,{ elapsed: 200});
  const btnClickSwitch= Rx.switcher( btnClicksBatch, {
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
}

// const btnClickCount = Rx.transform(btnClicksBatch, v => ({length:v.length, paths:v.map(event=>event.composedPath())}));
// btnClickCount.on(msg => {
//   console.log(msg.value);
// });

/**
 * Listen for changes in data, manually update accordingly
 */
function testBindDiffUpdate() {
  const rxObject = Rx.fromObject({name:`Jane`, ticks:0});
  const b = Rx.Dom.bindDiffUpdate(rxObject, document.getElementById(`lblObj`),  (diffs, el) => {
    for (const diff of diffs) {
      // Only carea about changes to the 'ticks' field
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
}
testBindDiffUpdate();