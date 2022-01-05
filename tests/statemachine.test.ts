import {StateMachine} from '../src/StateMachine.js';

const createAdsr = () => ({
  attack: `decay`,
  decay: `sustain`,
  sustain: `release`,
  release: null
});

const createMulti = () => ({
  awake: [`breakfast`, `coffee`],
  breakfast: `coffee`,
  coffee: `brushTeeth`,
  brushTeeth: null
});

// Tests that transitions defined as arrays can be navigated
// Also tests .next() function for progressing
const testPaths = () => {
  const m = createMulti();
  const debug = false;
  let sm = new StateMachine(`awake`, m, {debug: debug});

  try {
    sm.state = `brushTeeth`;
    throw Error(`testPaths illegal state change allowed`);
  } catch (e) { /* noop */ }

  sm.state = `coffee`;
  sm.state = `brushTeeth`;

  if (!sm.isDone()) throw Error(`Machine should be done`);

  sm = new StateMachine(`awake`, m, {debug: debug});
  sm.state = `breakfast`;
  sm.state = `coffee`;
  sm.state = `brushTeeth`;
  if (!sm.isDone()) throw Error(`Machine should be done`);

  sm = new StateMachine(`awake`, m, {debug: debug});
  if (sm.isDone()) throw Error(`Finalised unexpectedly (1)`);
  if (sm.next() !== `breakfast`) throw Error(`Did not choose expected state`);
  if (sm.isDone()) throw Error(`Finalised unexpectedly (2)`);
  if (sm.next() !== `coffee`) throw Error(`Did not choose expected state`);
  if (sm.isDone()) throw Error(`Finalised unexpectedly (3)`);
  if (sm.next() !== `brushTeeth`) throw Error(`Did not choose expected state`);
  if (!sm.isDone()) throw Error(`Finalised unexpectedly (4)`);
  if (sm.next() !== null) throw Error(`Did not finalise as expected (1)`);
  if (!sm.isDone()) throw Error(`Machine should be done`);

  console.log(`Test paths OK`);
};

// Test that machine throws an error for an unknown state
const testUnknownState = () => {
  const m = createAdsr();
  let caught = false;
  try {
    new StateMachine(`blah`, m, {debug: false});
  } catch (e) {
    caught = true;
  }
  if (!caught) throw Error(`testCtorInitialState`);

  const sm = new StateMachine(`attack`, m, {debug: false});
  try {
    // @ts-ignore
    sm.state = undefined;
  } catch (e) {
    caught = true;
  }
  if (!caught) throw Error(`Undefined state was wrongly allowed (1)`);

  try {
    sm.state = `blah`;
  } catch (e) {
    caught = true;
  }
  if (!caught) throw Error(`Undefined state was wrongly allowed (2)`);

  console.log(`testUnknownState OK`);
};

// Tests that machine finalises after all states transition
const testFinalisation = () => {
  const m = createAdsr();
  const sm = new StateMachine(`attack`, m, {debug: false});
  sm.state = `decay`;
  sm.state = `sustain`;
  sm.state = `release`; // Finalises
  const states = Object.keys(m);
  for (const state of states) {
    if (state === `release`) continue;
    try {
      sm.state = state;
      throw Error(`testFinalisation: did not prevent change from final state: ${state}`);
    } catch (e) { /* no op */ }
  }
  console.log(`testFinalisation OK`);
};

// Test that all event ransitions happen, and there are no unexpected transitions
const testEvents = async () => {
  const m = createAdsr();
  const sm = new StateMachine(`attack`, m, {debug: false});

  let expected = [`attack-decay`, `decay-sustain`, `sustain-release`];
  sm.addEventListener(`change`, (evt) => {
    const key = evt.priorState + `-` + evt.newState;
    if (!expected.includes(key)) throw Error(`Unexpected transition: ${evt.priorState} -> ${evt.newState}`);

    expected = expected.filter(k => k !== key);
  });

  sm.state = `decay`;
  sm.state = `sustain`;
  sm.state = `release`;

  const p = new Promise((resolve, reject) => {
    setTimeout(() => {
      if (expected.length > 0) {
        throw Error(`Transitions did not occur: ${expected.join(`, `)}`);
      }

      console.log(`testEvents OK`);
      resolve(`ok`);
    }, 100);
  });
  return p;
};

testFinalisation();
testUnknownState();
await testEvents();
testPaths();

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