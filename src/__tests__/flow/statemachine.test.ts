/* eslint-disable */
import { expect, test } from '@jest/globals';
import {StateMachine, descriptionFromList} from '../../flow/StateMachine.js';
import {jest} from '@jest/globals';


const createAdsr = () => descriptionFromList(`attack`, `decay`, `sustain`, `release`);
const createMulti = () => ({
  awake: [`breakfast`, `coffee`],
  breakfast: `coffee`,
  coffee: `brushTeeth`,
  brushTeeth: null
});

// Tests that transitions defined as arrays can be navigated
// Also tests .next() function for progressing
test( `paths`, () => {
  const m = createMulti();
  const debug = false;
  let sm = new StateMachine(`awake`, m, {debug: debug});

  // Try one path
  expect(() => { sm.state = `brushTeeth`}).toThrow();
  expect(() => { sm.state = `coffee`}).not.toThrow();
  expect(() => { sm.state = `brushTeeth`}).not.toThrow();
  expect(sm.isDone).toBeTruthy();

  // Try a different valid path
  sm = new StateMachine(`awake`, m, {debug: debug});
  expect(() => { sm.state = `breakfast`}).not.toThrow();
  expect(() => { sm.state = `coffee`}).not.toThrow();
  expect(() => { sm.state = `brushTeeth`}).not.toThrow();
  expect(sm.isDone).toBeTruthy();
  
  // Try auto-progression
  sm = new StateMachine(`awake`, m, {debug: debug});
  expect(sm.isDone).toBeFalsy();
  
  expect(sm.next()).toEqual(`breakfast`);
  expect(sm.isDone).toBeFalsy();

  expect(sm.next()).toEqual(`coffee`);
  expect(sm.isDone).toBeFalsy();

  expect(sm.next()).toEqual(`brushTeeth`);
  expect(sm.isDone).toBeTruthy();

  expect(sm.next()).toBeNull();
  expect(sm.isDone).toBeTruthy();
  
});

// Test that machine throws an error for an unknown state
test(`transitions`, () => {
  const m = createAdsr();

  // Should throw creating a machine with invalid initial state
  expect( () => {
    new StateMachine(`blah`, m, {debug: false});
  }).toThrowError();

  const sm = new StateMachine(`attack`, m, {debug: false});
  
  // Shouldn't be possible to set to undefined
  expect(() => {
    // @ts-ignore
    sm.state = undefined
  }).toThrowError();

  expect(() => {
    // @ts-ignore
    sm.state = null
  }).toThrowError();
  
  // Invalid state
  expect(() => {
    sm.state = `blah`
  }).toThrowError();

  // State is defined, but invalid from intial state of attack
  expect(() => {
    sm.state = `release`
  }).toThrowError();
  
});

// Tests that machine finalises after all states transition
test(`finalisation`, () => {
  const m = createAdsr();
  const sm = new StateMachine(`attack`, m, {debug: false});
  sm.state = `decay`;
  sm.state = `sustain`;
  sm.state = `release`; // Finalises
  expect(sm.isDone).toBeTruthy();

  // Test that we can't transition out of final state
  const states = Object.keys(m);
  for (const state of states) {
    if (state === `release`) continue;
    expect(() => {
      sm.state = state; // Should throw
    }).toThrowError();
  }
});

// const waitForSpy = async (spy: jest.SpyInstance<Promise<unknown>>) => {
//   expect(spy).toHaveBeenCalledTimes(1)
//   await spy.mock.instances[0]
// }

const eventPromise = (obj:any, event:string, exec:()=>void) => {
  return new Promise((resolve, reject) => {
    let handler = (data:any) => {
      obj.removeEventListener(handler);
      resolve(data);
    }; 
    obj.addEventListener(event, handler);
    exec();
  });
};


// Test that all event ransitions happen, and there are no unexpected transitions
test( `events`, async () => {
  const m = createAdsr();
  const sm = new StateMachine(`attack`, m, {debug: false});

  const onStopped = jest.fn();
  sm.addEventListener(`stop`, onStopped);

  expect(await eventPromise(sm, `change`, () => sm.state = `decay`)).toMatchObject({
    priorState: `attack`, newState: `decay`
  });


  expect(await eventPromise(sm, `change`, () => sm.state = `sustain`)).toMatchObject({
    priorState: `decay`, newState: `sustain`
  });

  expect(await eventPromise(sm, `change`, () => sm.state = `release`)).toMatchObject({
    priorState: `sustain`, newState: `release`
  });

  expect(onStopped).toBeCalled();
});

/* 
let m = new StateMachine('delay', adsrDemo, {debug: true});
m.addEventListener('change', (evt) => {
  console.log(`change event handler: ${evt.priorState} -> ${evt.newState}`);
});


for (let i = 0; i < 10; i++) {
  console.log(`firing ${i} isDone: ${m.isDone()}`);
  m.fire('burp', {hello: 'Dave'});
  if (!m.fire('next')) {
    console.log(' -- cannot fire');
  }
}

let simpleTest = createListMachine(['a', 'b', 'c', 'd', 'e']);
simpleTest.addEventListener('change', (evt) => {
  console.log(`change event handler2: ${evt.priorState} -> ${evt.newState}`);
})

for (let i = 0; i < 10; i++) {
  console.log(`next ${i} isDone: ${simpleTest.isDone()}`);
  if (!simpleTest.next()) {
    console.log(' -- no more next');
  }
}*/