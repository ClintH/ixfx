import { Chain} from '../../../dist/generators.js';

/**
 * Creates/updates an element per value that passes through the chain
 */
function createElementsFromData() {
  const objects = [{name:`bob`},{name:`bob`},{name:`bob`},{name:`bob`},{name:`bob`}];
  const ch = Chain.run(
    Chain.fromFunction(() => Math.floor(Math.random()*5)),
    Chain.Links.delay({before:1000}),
    Chain.Dom.perValue()
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
createElementsFromData();