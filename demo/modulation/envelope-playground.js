import {Lines, Plot, Envelopes, Paths, Beziers, Drawing, MultiPaths, Points, Rects} from "../../dist/bundle.mjs";

let env = Envelopes.adsr();

let draw = null;
let polyline = null;
let envIndicator = null;
let envValueVis = document.getElementById('envValueVis');
let envValue = document.getElementById('envValue');
let envStage = document.getElementById('envStage');

const setSlider = function (id, v) {
  if (id.endsWith('Amp')) v *= 100;
  document.getElementById(id).value = v;
}

const setSliders = function (idBase, v) {
  if (idBase !== 'decay')
    setSlider(idBase + 'Amp', v[1]);
  setSlider(idBase + 'Period', v[0]);

}

const setup = function () {
  draw = SVG().addTo('#envelope').size('100%', '100%');
  polyline = createLine();
  envIndicator = draw.circle(20);

  // Sync UI to start settings
  setSliders('attack', env.get(EnvelopeGenerator.Stages.Attack));
  setSliders('decay', env.get(EnvelopeGenerator.Stages.Decay));
  setSliders('sustain', env.get(EnvelopeGenerator.Stages.Sustain));
  setSliders('release', env.get(EnvelopeGenerator.Stages.Release));
  document.getElementById('looping').checked = env.looping;

  // Redraw line on window resize
  window.addEventListener('resize', () => {
    updateLine(polyline);
  })
  document.getElementById('btnDump').addEventListener('click', () => {
    dumpEnv(env);
  });
  document.getElementById('btnTrigger').addEventListener('click', () => {
    env.reset();
  });

  // Listen for changes in widgets, update envelope and drawing
  document.getElementById('looping').addEventListener('input', (evt) => {
    env.looping = evt.target.checked;
  });
  document.getElementById('attackSliders').addEventListener('input', () => {
    env.set(EnvelopeGenerator.Stages.Attack, getRange('attackAmp'), getRange('attackPeriod'));
    updateLine(polyline);
  });
  document.getElementById('decaySliders').addEventListener('input', () => {
    env.set(EnvelopeGenerator.Stages.Decay, 0, getRange('decayPeriod'));
    updateLine(polyline);
  });
  document.getElementById('sustainSliders').addEventListener('input', () => {
    env.set(EnvelopeGenerator.Stages.Sustain, getRange('sustainAmp'), getRange('sustainPeriod'));
    updateLine(polyline);
  });
  document.getElementById('releaseSliders').addEventListener('input', () => {
    env.set(EnvelopeGenerator.Stages.Release, getRange('releaseAmp'), getRange('releasePeriod'));
    updateLine(polyline);
  });

  window.requestAnimationFrame(envStatus);
}

const envStatus = function () {
  const v = env.calculate();
  envValue.innerText = v;
  envStage.innerText = env.getStage();
  envValueVis.style.backgroundColor = `rgba(0,0,0,${v})`;

  //let lineLength = polyline.length();
  //let point = polyline.pointAt(v * lineLength);

  //console.log(point);

  let p = getPointAlongLine(polyline.array(), v);
  envIndicator.attr({cx: p[0], cy: p[1]});

  window.requestAnimationFrame(envStatus);
}

const getRange = function (id) {
  let v = parseInt(document.getElementById(id).value);

  if (id.endsWith('Amp')) v /= 100;
  return v;
}


const distanceBetweenPoints = function (a, b) {
  return Math.sqrt(Math.pow(b[0] - a[0], 2) + (Math.pow(b[1] - a[1], 2)));
}

const pointBetweenPoints = function (a, b, distance) {
  let d = distanceBetweenPoints(a, b);
  let r = distance / d;

  return [
    a[0] - (distance * (a[0] - b[0]) / d),
    a[1] - (distance * (a[1] - b[1]) / d),
  ];
}

const computeLength = function (polyline) {
  let total = 0;
  for (let i = 0; i < polyline.length - 1; i++) {
    let a = polyline[i];
    let b = polyline[i + 1];
    total += distanceBetweenPoints(a, b);
  }
  return total;
}


const getPointAlongPolyline = function (polyline, percentage) {
  if (isNaN(percentage)) throw Error('Percentage is NaN');
  if (percentage < 0) throw Error('Percentage must be above zero');
  if (percentage > 1) throw Error('Percentage must be less than or equal to 1');

  if (percentage == 0) return polyline[0];
  if (percentage == 1) return polyline[polyline.length - 1];
  let total = computeLength(polyline);
  let distance = total * percentage;
  let travelled = 0;

  for (var i = 0; i < polyline.length; i++) {
    let a = polyline[i];
    let b = polyline[i + 1];

    let d = distanceBetweenPoints(a, b);
    travelled += d;

    if (travelled === distance) return b[1];
    if (travelled > distance) {
      let diff = d - (travelled - distance);
      return pointBetweenPoints(a, b, diff);
    }
  }
  return null;
}


const updateLine = function (l) {
  const bounds = document.getElementById('envelope').getBoundingClientRect();
  const padding = 5;
  const xScale = (bounds.width - (padding * 2)) / env.getTotalPeriod();
  const yScale = (bounds.height - (padding * 2)) / 1.0;// env.getMaxLevel();
  let culmX = 0;
  const scale = ([unit, amp]) => {
    const result = [
      (unit * xScale) + culmX,
      bounds.height - padding - (amp * yScale)
    ];
    culmX = result[0];
    return result;
  };
  l.plot([
    [padding, bounds.height - padding],
    scale(env.get(EnvelopeGenerator.Stages.Attack)),
    scale(env.get(EnvelopeGenerator.Stages.Decay)),
    scale(env.get(EnvelopeGenerator.Stages.Sustain)),
    scale(env.get(EnvelopeGenerator.Stages.Release))
  ]);

}

const dumpEnv = function (env) {
  let helper = {
    attack: env.periods[0],
    attackLevel: env.levels[0],
    decay: env.periods[1],
    sustain: env.periods[2],
    sustainLevel: env.levels[2],
    release: env.periods[3],
    releaseLevel: env.levels[3],
    looping: env.looping
  }
  console.log(helper);
}
const createLine = function () {
  // Create a line with number of segments we need
  const l = draw.polyline([
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0]
  ]);
  l.fill('none');
  l.stroke({color: '#f06', width: 4, linecap: 'round', linejoin: 'round'});
  return l;
}

setup();
updateLine(polyline);