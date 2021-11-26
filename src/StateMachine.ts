//export type StateChangeCallback = (newState: string, priorState: string) => void;
import {SimpleEventEmitter, Listener} from "./Events.js"

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

type StateName = string | number | Symbol;

export interface StateChangeEvent {
  newState: StateName,
  priorState: StateName
};

export interface StopEvent {
  state: StateName;
}

// type Paths<T> = T extends MachineDescription
//   ? keyof T | {[K in keyof T]: Paths<T[K]['events']>}[keyof T]
//   : never

type StateMachineEventMap = {
  'change': StateChangeEvent,
  'stop': StopEvent
};

type ValidStates<M extends MachineDescription> = keyof M;

export interface State {
  [event: string]: string | Listener<StateMachineEventMap> | null;
}

interface MachineDescription {
  [key: string]: State;
}

// export type StateEventCallback<M extends MachineDescription> = (event: string, state: ValidStates<M>, params: any, machine: StateMachine<M>) => boolean;

class StateMachine<M extends MachineDescription> extends SimpleEventEmitter<StateMachineEventMap> {
  #stateName: ValidStates<M>;
  #state: State;
  #debug: boolean;
  #m: M;
  #isDone: boolean;

  constructor(initial: ValidStates<M>, m: M, opts: Options = {debug: false}) {
    super();

    if (m[initial] === undefined) throw Error(`Machine does not include initial state ${initial}`);
    this.#m = m;
    this.#isDone = false;
    this.#debug = opts.debug ?? false;
    this.#stateName = initial as string;
    this.#state = m[initial];
  }

  isDone() {
    return this.#isDone;
  }

  #setState(newState: ValidStates<M>): boolean {
    const priorState = this.#stateName;

    if (this.#m[newState] === undefined) throw Error(`Machine cannot change to non-existent state ${newState}`);
    if (this.#debug) console.log(`StateMachine: ${priorState} -> ${newState}`);

    this.#stateName = newState;
    this.#state = this.#m[newState];

    this.fireEvent('change', {newState: newState, priorState: priorState});
    return true;
  }

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
      this.#isDone = true;
      this.fireEvent('stop', {state: this.#stateName});
      return false;
    } else {
      // Call function
      handler(params, this);
      return true;
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
m.addEventListener('change', (evt) => {
  console.log(`change event handler: ${evt.priorState} -> ${evt.newState}`);
});

for (let i = 0; i < 10; i++) {
  console.log(`firing ${i} isDone: ${m.isDone()}`);
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
}