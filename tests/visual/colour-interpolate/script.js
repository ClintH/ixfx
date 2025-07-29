
import { Colour } from '../../../bundle/visual.js';

const colourA = `blue`;
const colourB = `red`;
const incrementWidth = 20;

// const colours = ['rebeccapurple', 'yellow', 'red'];
// const ci = Colour.in(colours, { space: 'lab' });

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

  //let w = Math.max(1, canvasWidth * step);
  let h = 200;
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

drawInterpolation(Colour.HslSpace.interpolator(colourA, colourB, `shorter`), `hsl-shorter`);
drawInterpolation(Colour.HslSpace.interpolator(colourA, colourB, `longer`), `hsl-longer`);

drawInterpolation(Colour.OklchSpace.interpolator(colourA, colourB, `shorter`), `oklch-shorter`);
drawInterpolation(Colour.OklchSpace.interpolator(colourA, colourB, `longer`), `oklch-longer`);

drawInterpolation(Colour.SrgbSpace.interpolator(colourA, colourB), `srgb`);
