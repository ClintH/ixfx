import * as Rx from '../../../dist/rx.js';
import * as Numbers from '../../../dist/numbers.js';

// Scenario 1
// Problem Data emits at different rates, depending on sources
// since each one will trigger a 'latest' value.
const scenario1 = () => {
  const test = Rx.combineLatestToObject({
    range: Rx.From.domValueAsNumber(`#inputRange`, 
    {
      when:`progress`, 
      makeRelative: true
    }),
    colour: Rx.From.domValueAsHsl(`#inputColour`)
    // rand: Rx.From.func(Math.random,{interval:1000}),
    // osc: Rx.From.iterator(Numbers.pingPongPercent(), {readInterval:1000})
  });

  console.log(`Initial`, test.last());
  
  test.value(v => {
    console.log(v);
  });
}

scenario1();