
import { Colour } from '../../../bundle/src/visual.js';

const colourA = `blue`;
const colourB = `red`;
const colourC = `green`;

const incrementWidth = 20;
const h = 200;
// const colours = ['rebeccapurple', 'yellow', 'red'];
// const ci = Colour.in(colours, { space: 'lab' });

/**
 * 
 * @param {Colour.ColourInterpolator<any>} interpolator 
 * @param {string} elementId 
 */
const drawInterpolation = (interpolator, elementId) => {
  const el = /** @type HTMLCanvasElement */(document.getElementById(elementId));
  const ctx = el.getContext(`2d`);
  // @ts-ignore
  const cw = Number.parseInt(el.getAttribute(`width`));
  const incrementBy = incrementWidth / cw;
  if (!ctx) throw new Error(`Context unavailable`);

  let v = 0;
  let x = 0;
  let y = 0;

  while (v <= 1) {
    const colour = interpolator(v);
    ctx.fillStyle = Colour.toCssColour(colour);
    //console.log(`orig: ${JSON.stringify(colour)} conv: '${Colour.toCssColour(colour)}'`);
    ctx.fillRect(x, y, incrementWidth, h);
    x += incrementWidth;
    v += incrementBy;
  }

  const aScalar = Colour.OklchSpace.toScalar(colourA);
  ctx.fillStyle = Colour.toCssColour(aScalar);
  ctx.fillRect(0, 0, 5, 5);

  const bScalar = Colour.OklchSpace.toScalar(colourB);
  ctx.fillStyle = Colour.toCssColour(bScalar);
  ctx.fillRect(5, 5, 5, 5);
}

/**
 * 
 * @param {(amount:number)=>Colour.Colour} fn 
 * @param {string} elementId 
 */
function drawContinuous(fn, elementId) {
  const el = /** @type HTMLCanvasElement */(document.getElementById(elementId));
  const ctx = el.getContext(`2d`);
  if (!ctx) throw new Error(`Context unavailable`);
  // @ts-ignore
  const cw = Number.parseInt(el.getAttribute(`width`));
  const incrementBy = 1 / cw;

  let v = 0;
  let x = 0;
  let y = 0;

  while (v <= 1) {
    const colour = fn(v);
    ctx.fillStyle = Colour.toCssColour(colour);
    ctx.fillRect(x, y, 1, h);
    x += 1;
    v += incrementBy;
  }
}

drawInterpolation(Colour.HslSpace.interpolator(colourA, colourB, `shorter`), `hsl-shorter`);
drawInterpolation(Colour.HslSpace.interpolator(colourA, colourB, `longer`), `hsl-longer`);

drawInterpolation(Colour.OklchSpace.interpolator(colourA, colourB, `shorter`), `oklch-shorter`);
drawInterpolation(Colour.OklchSpace.interpolator(colourA, colourB, `longer`), `oklch-longer`);

drawInterpolation(Colour.SrgbSpace.interpolator(colourA, colourB), `srgb`);

drawContinuous(Colour.interpolator([colourA, colourB, colourC]), `continuous-default`);
drawContinuous(Colour.interpolator([colourA, colourB, colourC], { space: `hsl`, direction: `shorter` }), `continuous-hsl-shorter`);
drawContinuous(Colour.interpolator([colourA, colourB, colourC], { space: `hsl`, direction: `longer` }), `continuous-hsl-longer`);

drawContinuous(Colour.interpolator([colourA, colourB, colourC], { space: `srgb`, direction: `shorter` }), `continuous-srgb-shorter`);
drawContinuous(Colour.interpolator([colourA, colourB, colourC], { space: `srgb`, direction: `longer` }), `continuous-srgb-longer`);

drawContinuous(Colour.interpolator([colourA, colourB, colourC], { space: `oklch`, direction: `shorter` }), `continuous-oklch-shorter`);
drawContinuous(Colour.interpolator([colourA, colourB, colourC], { space: `oklch`, direction: `longer` }), `continuous-oklch-longer`);