import { Chains } from '../../../dist/iterables.js';

async function move() {
  const c = Chains.run(
    Chains.From.event(document, `pointermove`),
    Chains.Links.transform(v => {
      return {
        x: v.x/window.innerWidth, 
        y: v.y/window.innerHeight
      }
    })
  )
  for await (const v of c) {
    console.log(v);
  }
}
move();

/**
 * Creates/updates an element per value that passes through the chain
 */
function createElementsFromData() {
  const objects = [{name:`bob`},{name:`bob`},{name:`bob`},{name:`bob`},{name:`bob`}];
  const ch = Chains.run(
    Chains.From.func(() => Math.floor(Math.random()*5)),
    Chains.Links.delay({before:1000}),
    Chains.Dom.perValue()
  );

  setTimeout(async () => {
    for await (const v of ch) {
      const {el,value} = v;
      el.textContent = `${JSON.stringify(value)} - ${Date.now().toString()}`;
    }
    console.log(`ch iteration done`);
  });

  console.log(`createElementsFromData done`);
}
//createElementsFromData();