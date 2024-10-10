import { CanvasRegion, CanvasSource } from '../../../dist/visual.js';

const s = new CanvasSource(`canvas`);
const r = new CanvasRegion(s, {
  x: 100, y: 0, width: 100, height: 300
});

r.fill(`pink`);
r.drawBounds(`blue`);
