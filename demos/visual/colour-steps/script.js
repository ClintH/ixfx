import { Colour } from '../../../bundle/visual.js';

//const canvasWidth = 400;
const steps = 5;
const colourA = `blue`;
const colourB = `red`;
const colourC = `green`;
const exclusive = false;
const drawSteps = (colours, elementId) => {
  const el = /** @type HTMLCanvasElement */(document.getElementById(elementId));
  const ctx = el.getContext(`2d`);
  const canvasWidth = Number.parseInt(el.getAttribute(`width`));
  if (!ctx) throw new Error(`Ctx not created`);
  let v = 0;
  let x = 0;
  let y = 0;
  let w = canvasWidth / colours.length;
  let h = 200;

  ctx.fillStyle = `white`;
  ctx.fillRect(x, y, canvasWidth, h);

  while (v < colours.length) {
    ctx.fillStyle = Colour.toCssColour(colours[v]);
    ctx.fillRect(x, y, w, h);
    x += w;
    v++;
  }
}


drawSteps(Colour.createSteps(colourA, colourB, { steps, direction: `longer`, exclusive, space: `hsl` }), `hsl-steps-longer`);
drawSteps(Colour.createSteps(colourA, colourB, { steps, direction: `shorter`, exclusive, space: `hsl` }), `hsl-steps-shorter`);
drawSteps(Colour.scale([colourA, colourB, colourC], { stepsTotal: 10, direction: `longer`, space: `hsl` }), `hsl-scale-longer`);
drawSteps(Colour.scale([colourA, colourB, colourC], { stepsTotal: 10, direction: `shorter`, space: `hsl` }), `hsl-scale-shorter`);


drawSteps(Colour.createSteps(colourA, colourB, { steps, direction: `longer`, exclusive, space: `oklch` }), `oklch-steps-longer`);
drawSteps(Colour.createSteps(colourA, colourB, { steps, direction: `shorter`, exclusive, space: `oklch` }), `oklch-steps-shorter`);
drawSteps(Colour.scale([colourA, colourB, colourC], { stepsTotal: 10, direction: `longer`, space: `oklch` }), `oklch-scale-longer`);
drawSteps(Colour.scale([colourA, colourB, colourC], { stepsTotal: 10, direction: `shorter`, space: `oklch` }), `oklch-scale-shorter`);


drawSteps(Colour.createSteps(colourA, colourB, { steps, direction: `longer`, exclusive, space: `srgb` }), `srgb-steps-longer`);
drawSteps(Colour.createSteps(colourA, colourB, { steps, direction: `shorter`, exclusive, space: `srgb` }), `srgb-steps-shorter`);
drawSteps(Colour.scale([colourA, colourB, colourC], { stepsTotal: 10, direction: `longer`, space: `srgb` }), `srgb-scale-longer`);
drawSteps(Colour.scale([colourA, colourB, colourC], { stepsTotal: 10, direction: `shorter`, space: `srgb` }), `srgb-scale-shorter`);
