//import {Lines, Plot, Envelopes, Paths, Beziers, Drawing, MultiPaths, Points, Rects} from '../../dist/bundle.js';
import * as Envelopes from '../../../src/modulation/Envelope';
import * as MultiPaths from '../../../src/geometry/MultiPath';
import * as Paths from '../../../src/geometry/Path';

/// <reference path="../../lib/svg.3.1.1.d.ts"/>
import * as Svgjs from '../../lib/svg.esm';//@svgdotjs/svg.js';

const SVG = Svgjs.SVG;

let envOpts = {
  sustainLevel: 0,
  attackBend: 0,
  decayBend: 0,
  timerSource: Envelopes.msRelativeTimer,
  looping: true,
  delayDuration: 100,
  attackDuration: 500,
  decayDuration: 500,
  releaseDuration: 1000
}

let env = Envelopes.dadsr(envOpts);
let draw = null;
let svgLine = null;
let envIndicator = null;
let envValueVis = document.getElementById('envValueVis');
let envValue = document.getElementById('envValue');
let envStage = document.getElementById('envStage');

const createEnvelope = function () {
  let e = Envelopes.dadsr(envOpts);
  updateLine(e, svgLine);
  return e;
}

const setSlider = function (id, v) {
  if (id.endsWith('Amp')) v *= 100;
  // @ts-ignore
  document.getElementById(id).value = v;
};

const setSliders = function (idBase, v) {
  // Update corresponding amp slider for stages that need it
  if (idBase !== 'decay' && idBase !== 'delay')
    setSlider(idBase + 'Amp', v[1]);

  setSlider(idBase + 'Period', v[0]);
};

const setup = function () {
  draw = SVG().addTo('#envelope').size('100%', '100%');
  svgLine = createSvgLine();
  env = createEnvelope();
  createEnvelope();

  envIndicator = draw.circle(20);

  // Sync UI to start settings
  setSliders('delay', env.getStage(Envelopes.Stage.Delay));
  setSliders('attack', env.getStage(Envelopes.Stage.Attack));
  setSliders('decay', env.getStage(Envelopes.Stage.Decay));
  setSliders('sustain', env.getStage(Envelopes.Stage.Sustain));
  setSliders('release', env.getStage(Envelopes.Stage.Release));
  // @ts-ignore
  document.getElementById('looping').checked = env.looping;

  // Redraw line on window resize
  window.addEventListener('resize', () => {
    updateLine(svgLine);
  })
  document.getElementById('btnDump').addEventListener('click', () => {
    dumpEnv(env);
  });
  document.getElementById('btnTrigger').addEventListener('click', () => {
    env.reset();
  });

  // Listen for changes in widgets, update envelope and drawing
  document.getElementById('looping').addEventListener('input', (evt) => {
    // @ts-ignore
    env.looping = evt.target.checked;
  });
  document.getElementById('delaySliders').addEventListener('input', () => {
    envOpts.delayDuration = getRange('delayPeriod');
    createEnvelope();
  });
  // document.getElementById('attackSliders').addEventListener('input', () => {
  //   env.set(Envelopes.Stage.Attack, getRange('attackAmp'), getRange('attackPeriod'));
  //   updateLine(polyline);
  // });
  // document.getElementById('decaySliders').addEventListener('input', () => {
  //   env.set(Envelopes.Stage.Decay, 0, getRange('decayPeriod'));
  //   updateLine(polyline);
  // });
  // document.getElementById('sustainSliders').addEventListener('input', () => {
  //   env.set(Envelopes.Stage.Sustain, getRange('sustainAmp'), getRange('sustainPeriod'));
  //   updateLine(polyline);
  // });
  // document.getElementById('releaseSliders').addEventListener('input', () => {
  //   env.set(Envelopes.Stage.Release, getRange('releaseAmp'), getRange('releasePeriod'));
  //   updateLine(polyline);
  // });

  window.requestAnimationFrame(envStatus);
}

const envStatus = function () {
  const [stage, v] = env.compute();
  envValue.innerText = v.toFixed(2);
  envStage.innerText = Envelopes.stageToText(stage);
  envValueVis.style.backgroundColor = `rgba(0,0,0,${v})`;

  //let lineLength = polyline.length();
  //let point = polyline.pointAt(v * lineLength);

  //console.log(point);

  let p = getPointAlongLine(polyline.array(), v);
  envIndicator.attr({cx: p[0], cy: p[1]});
  window.addEventListener
  window.requestAnimationFrame(envStatus);
}

const getRange = function (id) {
  let v = parseInt(document.getElementById(id).value);

  if (id.endsWith('Amp')) v /= 100;
  return v;
}

/*
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
*/


/**
 * Updates SVG line to match envelope properties
 *
 * @param {Readonly<Envelopes.Envelope & Paths.WithBeziers>} env
 * @param {Envelopes.DadsrEnvelopeOpts} opts 
 * @param {*} svgLine
 */
const updateLine = function (env, opts, svgLine) {
  const bounds = document.getElementById('envelope').getBoundingClientRect();
  const padding = 5;

  const paths = env.getBeziers();
  const dimensions = MultiPaths.computeDimensions(paths);

  const xScale = (bounds.width - (padding * 2)) / dimensions.totalLength;
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
  svgLine.plot([
    [padding, bounds.height - padding],
    scale(opts.),
    scale(env.get(EnvelopeGenerator.Stages.Decay)),
    scale(env.get(EnvelopeGenerator.Stages.Sustain)),
    scale(env.get(EnvelopeGenerator.Stages.Release))
  ]);
}

const dumpEnv = function (env) {
  let helper = {
    delay: env.periods[0],
    attack: env.periods[1],
    attackLevel: env.levels[1],
    decay: env.periods[2],
    sustain: env.periods[3],
    sustainLevel: env.levels[3],
    release: env.periods[4],
    releaseLevel: env.levels[4],
    looping: env.looping
  }
  console.log(helper);
}
const createSvgLine = function () {

  // Create a line with number of segments we need  
  const l = draw.polyline([
    [0, 0],
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