//export type StateChangeCallback = (newState: string, priorState: string) => void;
import {SimpleEventEmitter, Listener} from "./Events.js";

/*
type MappedTypeWithNewProperties<Type> = {
  [Properties in keyof Type as NewKeyType]: Type[Properties]
}
*/
// type MachineEventMap<M extends MachineDescription> = {
//   [Properties in keyof M as ]
// }

export interface Options {
  debug?: boolean
}

//type StateName = string | number | Symbol;

export interface StateChangeEvent {
  newState: string,
  priorState: string
}

export interface StopEvent {
  state: string;
}

// type Paths<T> = T extends MachineDescription
//   ? keyof T | {[K in keyof T]: Paths<T[K]['events']>}[keyof T]
//   : never

type StateMachineEventMap = {
  change: StateChangeEvent
  stop: StopEvent
};

//type ValidStates<M extends MachineDescription> = keyof M & string;


type StateEvent = (args: any, sender: StateMachine) => string | any;
type StateHandler = string | StateEvent | null;

export interface State {
  [event: string]: StateHandler;
}

interface MachineDescription {
  [key: string]: string | string[] | null;
}

// export type StateEventCallback<M extends MachineDescription> = (event: string, state: ValidStates<M>, params: any, machine: StateMachine<M>) => boolean;

class StateMachine extends SimpleEventEmitter<StateMachineEventMap> {
  #state: string;
  #debug: boolean;
  #m: MachineDescription;
  #isDone: boolean;
  #initial: string;

  constructor(initial: string, m: MachineDescription, opts: Options = {debug: false}) {
    super();
    if (m[initial] === undefined) throw Error(`Machine does not include initial state ${initial}`);
    this.#initial = initial;
    this.#m = m;
    this.#debug = opts.debug ?? false;
    this.#state = initial;
    this.#isDone = false;
  }

  /**
   * Moves to the next state if possible. 
   * If machine is finalised, no error is thrown and null is returned.
   * 
   * @returns {(string|null)} Returns new state, or null if machine is finalised
   * @memberof StateMachine
   */
  next(): string | null {
    const r = this.#m[this.#state];
    if (r === null) return null;

    if (Array.isArray(r)) this.state = r[0];
    else this.state = r;
    return this.state;
  }

  isDone() {
    return this.#isDone;
  }

  reset() {
    this.#isDone = false;
    this.#state = this.#initial;
  }

  get state(): string {
    return this.#state;
  }

  set state(newState: string) {
    const priorState = this.#state;

    // Does state exist?
    if (this.#m[newState] === undefined) throw Error(`Machine cannot change to non-existent state ${newState}`);

    // Is transition allowed?
    let rules = this.#m[this.#state];
    if (Array.isArray(rules)) {
      if (!rules.includes(newState)) throw Error(`Machine cannot ${priorState} -> ${newState}. Allowed transitions: ${rules.join(`, `)}`);
    } else {
      if (newState !== rules && rules !== `*`) throw Error(`Machine cannot ${priorState} -> ${newState}. Allowed transition: ${rules}`);
    }

    if (this.#debug) console.log(`StateMachine: ${priorState} -> ${newState}`);

    this.#state = newState;

    rules = this.#m[newState];
    if (rules === null) this.#isDone = true;

    setTimeout(() => {
      this.fireEvent(`change`, {newState: newState, priorState: priorState});
    }, 1);
  }

  /*
  fire(eventName: string, params?: any): boolean {
    let handler = this.#state[eventName];
    if (handler === undefined) {
      if (this.#debug) console.log(`StateMachine: state '${this.#stateName}' has no handler for event '${eventName}'.`);
      return false; // Event is not handled in this state
    }
    if (typeof (handler) === 'string') {
      // Strings are assumed to be the next state
      return this.#setState(handler)
    } else if (handler == null) {
      this.#isDone = true;
      this.fireEvent('stop', {state: this.#stateName});
      return false;
    } else {
      // Call function
      let state = handler(params, this);
      if (state !== undefined && typeof state === 'string') {
        // If handler returns string, assume it's a new state
        this.#setState(state);
      }
      return true;
    }
  }*/

}

const createAdsr = () => {
  return {
    attack: `decay`,
    decay: `sustain`,
    sustain: `release`,
    release: null
  };
};

const createMulti = () => {
  return {
    awake: [`breakfast`, `coffee`],
    breakfast: `coffee`,
    coffee: `brushTeeth`,
    brushTeeth: null
  };
};

// Tests that transitions defined as arrays can be navigated
// Also tests .next() function for progressing
const testPaths = () => {
  const m = createMulti();
  const debug = false;
  let sm = new StateMachine(`awake`, m, {debug: debug});

  try {
    sm.state = `brushTeeth`;
    throw Error(`testPaths illegal state change allowed`);
  } catch (e) {};

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
    } catch (e) {
    }
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
    if (!expected.includes(key))
      throw Error(`Unexpected transition: ${evt.priorState} -> ${evt.newState}`);

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
interface ListMachineDefinition {
  [key: string]: State;
}

class ListStateMachine extends StateMachine {
  constructor(initial: string, listMachineDef: ListMachineDefinition, opts?: Options) {
    super(initial, listMachineDef, opts)
  }

  next(params?: any): boolean {
    return this.fire('next', params);
  }
}

const createListMachine = (list: string[], opts?: Options): ListStateMachine => {
  let map = {};
  for (let i = 0; i < list.length; i++) {
    let next = i < list.length - 1 ? list[i + 1] : null;
    let state = {next}
    // @ts-ignore
    map[list[i]] = state;
  }

  return new ListStateMachine(list[0], map, opts);
}

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