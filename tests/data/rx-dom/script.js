import * as Rx from '../../../dist/rx.js';
import * as Flow from '../../../dist/flow.js';
import { Elapsed } from '../../../dist/flow.js';
import * as Generators from '../../../dist/generators.js';
import * as Arrays from '../../../dist/arrays.js';

/**
 * Update textContent based on direct value
 */
function simpleDefault() {
  const getRandomSource = () => {
    const m = Rx.number(0);
    setInterval(() => {
      m.set(Math.random());
    }, 500);
    return m;
  };

  const random = getRandomSource();
  Rx.Dom.bind(random, {
    query: `#simple`});
}

/**
 * Same source stream, update several different elements
 */
function fields() {
  const colours = Arrays.cycle([`red`,`orange`,`yellow`,`green`]);
  const r = Rx.fromObject({ name: `Barry`, colour:`red`, size: 10 });
  setInterval(() => {
    r.updateField(`size`, Math.random()*10);
  }, 100);
  setInterval(() => {
    r.updateField(`colour`, colours.next());
  }, 1000);

  Rx.Dom.bind(r, 
    { query:`#fields-name`, sourceField:`name`},
    { query:`#fields-colour`, sourceField:`colour`, cssProperty:`background-color`},
    {query:`#fields-size`, sourceField:`size`, cssVariable:`size`, transformValue:(v) => v + `px`},
    {query:`#fields-blah`, transform:(v) => v.name.toUpperCase( )}
    )
}

function creationSimple() {
  const source = Rx.fromObject([`hello`]);
  const letters = `a b c d e f g h i j k l m n o p q r s t u v w x y z`.split(' ');
  console.log(letters);
  setInterval(() => {
    const count = Math.floor(Math.random()*10);
    const data = letters.slice(0, count);
    console.log(data); 
    source.set(data);
  }, 1000);

  Rx.Dom.elements(source, {
    container:`#creation`, 
    defaultTag:`span`
  });
}

/**
 * Tests the Dom.elements function which creates and updates HTML DOM elements
 * based on granular changes to the reactive object.
 */
function testElements() {
  const source = Rx.fromObject([
    { 
      name: `Bob`, address: { street:`West St`, number: 19 }
    },
    { 
      name: `Jane`, address: {
      street:`East St`, number: 20
      }
    }]
    );


  Rx.Dom.elements(source, {
    container:`#creation`, 
    defaultTag:`span`,
    binds: {
      'address.number': {
        htmlContent: true,
        transform: (v) => `#${v}`
      },
      'name': {
        htmlContent:true,
        transform: v => `Name: ${v}`
      },
      '_root.address': {
        htmlContent:true,
        nestChildren:true,
        tagName:`div`,
        transform: v => `Address:`
      },
      'address.street': {
        htmlContent:true,
        transform: v=> `${v}`
      },
      '_root': {
        htmlContent:true,
        nestChildren: true,
        tagName: `section`,
        transform: (v) => ``
      }
    }
  });

  // setInterval(() => {
  //   source.updateField(`1.address.number`, Math.floor(Math.random()*100));
  // }, 500);

  // setTimeout(() => {
  //   source.updateField(`0`, { name: `Bobby`, address: {street:`North St`, number: 12}});
  // }, 1000);

  // New item
  setTimeout(() => {
    console.log(`--- new --- `);
    const data = [
      ...source.last(),  
      { 
        name: `Ringo`, address: { street:`Apple St`, number: 99 }
      }
    ];
    console.log(data);
    source.set(data);
  }, 1500);

  // Delete
  setTimeout(() => {
    console.log(`--- delete ---`);
    const data = Arrays.remove(source.last(), 1);
    console.log(data);
    source.set(data);
  }, 2500);


}

testElements();