/* eslint-disable */
import { DomLog, domLog, DomLogOpts } from "../../src/dom/DomLog";
import {checkbox} from '../../src/dom/Forms';

let logger:DomLog;
let intervalId = 0;

const create = (opts:DomLogOpts) => {
  if (logger !== undefined) logger.dispose();
  opts = {...opts, capacity: 10};
  return domLog(`log`, opts);
};
logger = create({});

const start = () => {
  if (intervalId !== 0) return;
  intervalId = window.setInterval(() => {
    // Produce a random thing to log
    const dice = Math.round(Math.random() * 10);
    if (dice === 9) {
      try {
        throw new Error(`This is an Error`);
      } catch (err) {
        logger.error(err);
      }
    } else if (dice === 8) {
      logger.error(`This is a string error`);
    } else if (dice === 7) {
      logger.log({name:`Betty`, colour: `blue`, count: 10});
    } else if (dice === 6) {
      let ran = Math.random();
      if (ran > 0.9) ran = NaN;
      logger.log(ran);
    } else {
      logger.log(`The random number of the moment is ${Math.floor(Math.random()*10)}`);
    }
  }, 1000);
};

const stop = () => {
  if (intervalId === 0) return;
  window.clearInterval(intervalId);
  intervalId = 0;
};

const clear = () => {
  logger.clear();
};


document.getElementById(`btnStart`)?.addEventListener(`click`, start);
document.getElementById(`btnStop`)?.addEventListener(`click`, stop);
document.getElementById(`btnClear`)?.addEventListener(`click`, clear);
checkbox(`chkTimestamps`, (val) => {
  logger = create({timestamp: val});
});
start();
