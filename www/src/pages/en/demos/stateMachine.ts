/* eslint-disable */
import {domLog} from '~/dom/DomLog';
//import {domLog} from '../../../../../src/dom/DomLog';

import {checkbox, button, select} from '~/dom/Forms';

import {StateMachine, MachineDescription, Options as StateMachineOpts, StateChangeEvent, StopEvent} from '~/StateMachine';
import {AutoSort, FrequencyHistogramPlot} from '~/visualisation/FrequencyHistogramPlot';

const log = domLog(`dataStream`, {truncateEntries: 8, timestamp: false});

let currentSm:StateMachine|undefined;
const demoMachines = {
  morningRoutine: {
    description: { 
      sleep: 'wakeup',
      wakeup: ['coffee', 'breakfast'],
      coffee: `bike`,
      breakfast: `bike`,
      bike: null
    },
    initialState: `sleep`
  },
  loop: {
    description: {
      tideGoesIn: `tideGoesOut`,
      tideGoesOut: `tideGoesIn`
    },
    initialState: `tideIn`
  },
  bread: {
    description: {
      plain: ["toasted", "buttered", "eaten"],
      toasted: ["buttered", "eaten", "diced"],
      buttered: ["eaten", "marmaladed"],
      marmaladed: "eaten",
      diced: "sprinkled-on-soup",
      "sprinkled-on-soup": null,
      eaten: null
    },
    initialState: `plain`
  }
}
const btnChangeState = document.getElementById(`btnChangeState`) as HTMLButtonElement;
const descrValdate = document.getElementById(`descrValidate`);
const txtDescr = document.getElementById(`jsonDescr`);
txtDescr.addEventListener(`input`, () => {
  console.log(txtDescr.innerText);
  let [ok,msg] = parseDesc(txtDescr.innerText);
  if (ok) {
    msg = `✔ OK`;
    descrValdate.classList.remove(`error`);
  } else {
    msg = msg;
    descrValdate.classList.add(`error`);

  }
  descrValdate.innerHTML = msg;
});
const currentState = document.getElementById(`currentState`);
//const isMachineDone = document.getElementById(`isMachineDone`);
const selInitialStates = select(`selDescrInitial`);
const selPossibleNext = select(`selPossibleNext`, undefined, { placeholderOpt: `-- Auto --`, autoSelectAfterChoice:0 });

// Demo machine SELECT
const selDemoMachines = select(`selDemoMachines`, (newVal:string) => {
  // Machine selected. Set JSON text and initial state options
  let md = demoMachines[newVal];
  txtDescr.innerText = JSON.stringify(md.description, undefined, 2);
  selInitialStates.setOpts(Object.keys(md.description), md.initialState);
}, { placeholderChoose:true, autoSelectAfterChoice:0 });

// Assign list of demo machines
selDemoMachines.setOpts(Object.keys(demoMachines));

const parseDesc = (txt):[boolean, string] => {
  try {
    const description = JSON.parse(txt);
    selInitialStates.setOpts(Object.keys(description));
    return [true,``];
  } catch (ex) {
    return [false, ex.message];
  }
}

const btnSetDescr = button(`btnSetDescr`, () => {
  try {
    let txt = txtDescr.innerText;
    const description = JSON.parse(txt);
    const initial = selInitialStates.value;
    const sm = create(initial, description);
    if (currentSm) {
      /// TODO Remove event handlers
    }
    currentSm = sm;
    update(sm);
    log.clear();
  } catch (ex) {
    console.error(ex);
    log.error(ex.message);
    update(undefined);
  }
});


const update = (sm:StateMachine|undefined) => {
  if (sm === undefined) {
    btnChangeState.disabled = true;
    selPossibleNext.disabled = true;
  
    currentState.innerText = `(invalid JSON)`;
    //isMachineDone.innerHTML = `Not loaded`;
    selPossibleNext.setOpts([]);
    return;
  }

  currentState.innerText = `Current state: ${sm.state}`;
  //isMachineDone.innerHTML = sm.isDone ? `Machine complete` : `Transition(s) possible`;

  // Update list of possible next state(s)
  selPossibleNext.setOpts(sm.states.filter(state => sm.isValid(state)[0]));

  btnChangeState.disabled = sm.isDone;
  selPossibleNext.disabled = sm.isDone;
}

const create = (initial:string, description:MachineDescription):StateMachine => {
  let opts:StateMachineOpts = {
    debug: false
  };
  let sm = new StateMachine(initial, description, opts);
  
  // State machine has changed state
  sm.addEventListener(`change`, (evt:StateChangeEvent) => {
    log.log(`'${evt.priorState}' -> '${evt.newState}'`);
    update(sm);
  });
  
  sm.addEventListener(`stop`, (ev:StopEvent) => {
    log.log(`Completed. Final state: '${ev.state}'`);
  })
  return sm;
}

btnChangeState.addEventListener(`click`, () => {
  if (currentSm === undefined) {
    log.log(`No machine set`);
    return;
  }

  if (selPossibleNext.isSelectedPlaceholder) {
    currentSm.next();
  } else {
    currentSm.state = selPossibleNext.value;
  }
});



// Select first machine
selDemoMachines.select(1, true);
btnSetDescr.click();

// const run = () => {

// };

// const onStopped = () => {
// }

// const onReset = () => {
  
// }

// const onStarted = () => {

// }

// demoRun({intervalMs: 1000, run, onStarted, onStopped, onReset});
