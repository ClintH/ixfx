//export type StateChangeCallback = (newState: string, priorState: string) => void;

import {SimpleEventEmitter, Listener} from "./Events.js"

export interface State {
  [event: string]: string | Listener<StateMachineEventMap> | null;
}

export interface Machine {
  [key: string]: State;
}

export interface Options {
  debug?: boolean
}

type StateName = string | number | Symbol;

export interface StateChangeEvent {
  newState: StateName,
  priorState: StateName
};

export interface StopEvent {
  state: StateName;
}

interface StateMachineEventMap {
  '_change': StateChangeEvent,
  '_stop': StopEvent
}

type ValidStates<M extends Machine> = keyof M;

export type StateEventCallback<M extends Machine> = (event: string, state: ValidStates<M>, params: any, machine: StateMachine<M>) => boolean;

enum RunState {
  Started,
  Stopped
}

class StateMachine<M extends Machine> extends SimpleEventEmitter<StateMachineEventMap> {
  #stateName: ValidStates<M>;
  #state: State;
  #debug: boolean;
  #m: M;
  #runState: RunState;

  constructor(initial: ValidStates<M>, m: M, opts: Options = {debug: false}) {
    super();

    if (m[initial] === undefined) throw Error(`Machine does not include initial state ${initial}`);
    this.#m = m;
    this.#runState = RunState.Started;
    this.#debug = opts.debug ?? false;
    this.#stateName = initial as string;
    this.#state = m[initial];
  }

  isStopped() {
    return this.#runState == RunState.Stopped;
  }

  #setState(newState: ValidStates<M>): boolean {
    const priorState = this.#stateName;

    if (this.#m[newState] === undefined) throw Error(`Machine cannot change to non-existent state ${newState}`);
    if (this.#debug) console.log(`StateMachine: ${priorState} -> ${newState}`);

    this.#stateName = newState;
    this.#state = this.#m[newState];

    this.fireEvent('_change', {newState: newState, priorState: priorState});
    return true;
  }


  //  fire(eventName: string, params?: any): boolean {
  fire(eventName: string, params?: any): boolean {
    let handler = this.#state[eventName];
    if (handler === undefined) {
      if (this.#debug) console.log(`StateMachine: state '${this.#stateName}' has no handler for event '${eventName}'.`);
      return false; // Event is not handled in this state
    }
    if (typeof (handler) === 'string') {
      // Strings are assumed to be the next state
      return this.#setState(handler as string);
    } else if (handler == null) {
      this.#runState = RunState.Stopped;
      this.fireEvent('_stop', {state: this.#stateName});
      return false;
    } else {
      // Call function
      handler(params);
      return true;
      //return (handler as StateEventCallback<M>)(eventName, this.#stateName, params, this);
    }
  }
}

let demo = {
  delay: {
    next: 'attack'
  },
  attack: {
    next: 'decay'
  },
  decay: {
    next: 'sustain'
  },
  sustain: {
    next: 'release'
  },
  release: {
    next: null
  },
}

interface ListMachineDefinition {
  [key: string]: State;
}


class ListStateMachine extends StateMachine<ListMachineDefinition> {
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

  console.log(map);

  //let def:ListMachineDefinition = {}
  return new ListStateMachine(list[0], map, opts);
}

let m = new StateMachine<typeof demo>('delay', demo, {debug: true});
m.addEventListener('_change', (event) => {
  const evt = event as StateChangeEvent;
  console.log(`change event handler: ${evt.priorState} -> ${evt.newState}`);
});
for (let i = 0; i < 10; i++) {
  console.log(`firing ${i} isStopped: ${m.isStopped()}`);
  if (!m.fire('next')) {
    console.log(' -- cannot fire');
  }
}
/*
TODO
StateMachine events should be the events of the machine that is passed in

Maybe these two are added if one wants to hook into the internals. But it shouldn't generally be necesary
_change
 _stop

*/


let simpleTest = createListMachine(['a', 'b', 'c', 'd', 'e']);
simpleTest.addEventListener('_change', (event) => {
  const evt = event as StateChangeEvent;
  console.log(`change event handler2: ${evt.priorState} -> ${evt.newState}`);
})

for (let i = 0; i < 10; i++) {
  console.log(`next ${i} isStopped: ${simpleTest.isStopped()}`);
  if (!simpleTest.next()) {
    console.log(' -- no more next');
  }
}