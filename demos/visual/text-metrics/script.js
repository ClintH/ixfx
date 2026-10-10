import {CanvasHelper} from '../../../dist/dom.js';
import {Drawing} from '../../../dist/visual.js';
// https://loga.nz/blog/measuring-line-height/
const ch = new CanvasHelper(`canvas`,
  {width:1000,height:200}
);
const dh = Drawing.makeHelper(ch.ctx);

const ctx = ch.ctx;
const text = `Blacky sphinz quartz.`;
const textX = 120;
const textBaseline = 70;

ctx.textRendering = `optimizeLegibility`;
ctx.textBaseline = 'alphabetic';
ctx.font = `40pt serif`;
ctx.fillStyle = `black`;
ctx.fillText(text,textX,textBaseline);

const m = ctx.measureText(text);
console.log(m);
ctx.font = `8pt monospace`;
function verticalFromBaseline(height, x, strokeStyle = `pink`) {
  dh.connectedPoints([
    {x,y:textBaseline},
    {x,y:textBaseline-height}
], { strokeStyle});
}

function horizontal(y, strokeStyle=`pink`) {
  dh.connectedPoints([
    {x:0, y},
    {x:ch.width,y}
  ], {strokeStyle})
}

// verticalFromBaseline(m.emHeightAscent, 10);
// verticalFromBaseline(-m.emHeightDescent, 11);

function showEm(colour) {
  horizontal(textBaseline-m.emHeightAscent, colour);
  horizontal(textBaseline+m.emHeightDescent, colour);
  ctx.fillStyle = colour;
  ctx.textBaseline =`top`;
  ctx.fillText(`emHeightAscent: ${m.emHeightAscent.toFixed(2)}`, 2, textBaseline-m.emHeightAscent+2);
  ctx.fillText(`emHeightDescent: ${m.emHeightDescent.toFixed(2)}`, 2, textBaseline+m.emHeightDescent+2);
}

function showFont(colour) {
  let a = m.fontBoundingBoxAscent;
  let d = m.fontBoundingBoxDescent;
  horizontal(textBaseline-a, colour);
  horizontal(textBaseline+d, colour);

  ctx.fillStyle = colour;
  ctx.textBaseline =`top`;
  ctx.textAlign = `left`;
  ctx.fillText(`fontAscent: ${a.toFixed(2)}`, 2, textBaseline-a+2);
  ctx.fillText(`fontDescent: ${d.toFixed(2)}`, 2, textBaseline+d+2);
}


function showWidth(colour) {
  let widthY = textBaseline+5;
  dh.connectedPoints([
    {x:textX,y:widthY},
    {x:textX+m.width,y:widthY}
  ], {strokeStyle:colour});
  ctx.fillStyle = colour;
  ctx.textBaseline =`top`;
  
  ctx.fillText(`Width: ${m.width.toFixed(2)}`, textX, widthY+2);
  // {x:0, y:m.emHeightDescent}
}

function showBaseline(colour) {
  horizontal(textBaseline,colour);
  ctx.textBaseline = `top`;
  ctx.textAlign =`left`;
  ctx.fillStyle = colour;
  ctx.fillText(`Baseline`, 0, textBaseline+2);
}

function showActualBbox(colour) {
  let x = m.actualBoundingBoxLeft + textX;
  let width = m.actualBoundingBoxRight-m.actualBoundingBoxLeft;
  let height = m.actualBoundingBoxAscent+m.actualBoundingBoxDescent;
  let y = textBaseline-m.actualBoundingBoxAscent;
  dh.rect({x,y,width,height}, {strokeStyle:colour});

  ctx.fillStyle = colour;
  ctx.textBaseline = `top`;
  ctx.textAlign = `right`;
  ctx.fillText(`actual w: ${width.toFixed(2)}`, x+width,y+height+2);
  ctx.fillText(`actual h: ${height.toFixed(2)}`, x+width,y+height+2+10);
}


showBaseline(`whitesmoke`);
showEm(`pink`);
showWidth(`silver`);
showActualBbox(`green`);
showFont(`red`);