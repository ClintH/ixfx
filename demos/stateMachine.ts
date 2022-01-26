/* eslint-disable */
import {domLog} from '../src/dom/DomLog.js';
import {demoRun} from './demos.js';
import {checkbox, button, select} from '../src/dom/Forms.js';

import {StateMachine, MachineDescription, Options as StateMachineOpts, StateChangeEvent, StopEvent} from '../src/StateMachine.js';
import { FrequencyHistogramPlot} from '../src/visualisation/FrequencyHistogramPlot';

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
  }
}
const btnChangeState = document.getElementById(`btnChangeState`) as HTMLButtonElement;
const txtDescr = document.getElementById(`jsonDescr`);
const txtCurrentState = document.getElementById(`txtCurrentState`) as HTMLInputElement;
const chkIsDone = checkbox(`#chkIsDone`);
const selInitialStates = select(`#selDescrInitial`);
const selPossibleNext = select(`#selPossibleNext`, undefined, { placeholderOpt: `-- Auto --`, autoSelectAfterChoice:0 });

const selDemoMachines = select(`#selDemoMachines`, (newVal:string) => {
  let md = demoMachines[newVal];
  txtDescr.innerText = JSON.stringify(md.description, undefined, 2);
  selInitialStates.setOpts(Object.keys(md.description), md.initialState);
}, { placeholderChoose:true, autoSelectAfterChoice:0 });
selDemoMachines.setOpts(Object.keys(demoMachines));

const btnSetDescr = button(`#btnSetDescr`, () => {
  try {
    const description = JSON.parse(txtDescr.innerText);
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
  
    txtCurrentState.value = `(invalid JSON)`;
    chkIsDone.checked = true;
    selPossibleNext.setOpts([]);
    return;
  }

  txtCurrentState.value = sm.state;
  chkIsDone.checked = sm.isDone;

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
