import {Plot, Easings} from '../../../dist/bundle.mjs';

const overviewEl = document.getElementById('overview');
const timeInputEl = document.getElementById('timeInput');

const list = Easings.getEasings().sort();
let overviewMode = true;

const focusPlotter = new Plot(document.getElementById('focusPlot'), 500);
let focusEasing = null;
focusPlotter.showScale = false;
focusPlotter.showMiddle = false;

const easings = new Map();

const setOverviewMode = (name) => {
  if (name === undefined) {
    overviewMode = true;
    focusEasing = null;
    document.getElementById('focus').style.display = 'none';
    document.getElementById('overview').style.display = '';
  } else {
    overviewMode = false;
    document.getElementById('focus').style.display = '';
    document.getElementById('overview').style.display = 'none';
    document.getElementById('focusTitle').innerText = name;
    focusEasing = easings.get(name);
    focusEasing.instance.reset();
    focusPlotter.clear();

  }
};

const setup = (time) => {
  overviewEl.innerText = '';
  for (const name of list) {
    const p = document.createElement('div');
    const titleEl = document.createElement('h2');
    const plotEl = document.createElement('canvas');
    titleEl.innerText = name;
    plotEl.classList.add('plot');

    p.append(titleEl);
    p.append(plotEl);

    overviewEl.append(p);

    const plotter = new Plot(plotEl, 500);
    plotter.showScale = false;
    plotter.showMiddle = false;

    const e = {
      plotter: plotter,
      name: name,
      instance: Easings.timer(name, time)
    };
    if (focusEasing !== null && name === focusEasing.name) focusEasing = e;
    easings.set(name, e);

    p.addEventListener('click', (e) => {
      setOverviewMode(name);
      e.stopPropagation();
    });
  }
};


timeInputEl.addEventListener('change', () => {
  console.log('change');
  try {
    let v = parseInt(timeInputEl.value);
    if (v < 0) v = 1;
    setup(v);
  } catch (error) {
    console.log(error);
  }
});

document.body.addEventListener('click', (e) => {
  if (overviewMode) return;
  if (e.target.nodeName !== 'BODY') return;

  setOverviewMode(undefined);
});

document.getElementById('btnFocusBack').addEventListener('click', () => {
  setOverviewMode(undefined);
});

document.getElementById('focus').addEventListener('click', (e) => {
  focusPlotter.clear();
  focusEasing.instance.reset();
  e.stopPropagation();

});

document.getElementById('btnReset').addEventListener('click', () => {
  for (const [name, ease] of easings) {
    ease.instance.reset();
    ease.plotter.clear();
  }
});

setup(1000);


const loop = () => {
  if (!overviewMode) {
    const amt = focusEasing.instance.compute();
    const isDone = focusEasing.instance.isDone();

    if (!isDone) focusPlotter.push(amt);

    document.getElementById('easingColour').style.opacity = amt;
    document.getElementById('thing').style.transform = `translate(${Math.floor(amt * 380)}px)`;
  } else {
    for (const [name, ease] of easings) {
      const amt = ease.instance.compute();
      const isDone = ease.instance.isDone();
      if (!isDone) ease.plotter.push(amt);
    }
  }

  window.requestAnimationFrame(loop);
};

window.requestAnimationFrame(loop);


