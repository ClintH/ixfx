import { BipolarView } from '../../../dist/visual.js';

/**
 * 
 * @param {CanvasRenderingContext2D} ctx 
 * @param {number} width 
 * @param {number} height 
 */
const bgRender = (ctx, width, height) => {
  ctx.clearRect(0,0,width,height);
  const midX = width/2;
  const midY = height/2;
  ctx.fillStyle = `black`;
  ctx.save();
  ctx.translate(midX,midY);

  ctx.fillText(`Alert`, midX*0.1, -midY*0.8);
  ctx.fillText(`Excited`, midX*0.5, -midY*0.6);
  ctx.fillText(`Happy`, midX*0.6, -midY*0.2);

  ctx.fillText(`Content`, midX*0.6, midY*0.2);
  ctx.fillText(`Relaxed`, midX*0.5, midY*0.5);
  ctx.fillText(`Calm`, midX*0.1, midY*0.8);

  ctx.fillText(`Tense`, -midX*0.4, -midY*0.8);
  ctx.fillText(`Angry`, -midX*0.8, -midY*0.6);
  ctx.fillText(`Distressed`, -midX*0.9, -midY*0.2);

  ctx.fillText(`Bored`, -midX*0.3, +midY*0.8);
  ctx.fillText(`Depressed`, -midX*0.8, midY*0.5);
  ctx.fillText(`Sad`, -midX*0.9, midY*0.2);

  ctx.restore();
}

const opts = {
  asPercentages:true,
  showLabels: false,
  axisColour: `white`,
  renderBackground: bgRender
}
const plot = BipolarView.init(`#plot`, opts);

setInterval(() => {
  const x = Math.random() *2 - 1;
  const y = Math.random() *2 -1;
  plot(x,y);
}, 1000);