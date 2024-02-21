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

function creation() {
  const source = Rx.fromObject([
    { name: `Bob`, address: {
      street:`West St`, number: 19
      }
    },
    { name: `Jane`, address: {
      street:`East St`, number: 20
      }
    }]
    );
  setInterval(() => {
    source.updateField(`1.address.number`, Math.floor(Math.random()*100));
  }, 1000);
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
      'address': {
        htmlContent:true,
        nestChildren:true,
        tagName:`div`,
        transform: v => `Address:`
      },
      'address.street': {
        htmlContent:true,
        transform: v=> `Street: ${v}`
      },
      '_root': {
        htmlContent:true,
        nestChildren: true,
        tagName: `div`,
        transform: (v) => `<div><hr /></div>`
      }
    }
  });
}

creation();