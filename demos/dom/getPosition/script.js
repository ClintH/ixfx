import { positionFn, pointScaler } from '../../../dist/dom.js';
import { Points } from '../../../dist/geometry.js';

const prScreen = pointScaler('screen');
const prVp  = pointScaler('viewport');
const prDoc  = pointScaler('document');

window.addEventListener('click', evt => {
  const t = evt.target;
  document.querySelector('.selected')?.classList.remove('selected');

  console.group('positionFn Abs');
  console.log(`Viewport: ${Points.toString(positionFn(t, {target:'viewport'})())}`);
  console.log(`Document: ${Points.toString(positionFn(t, {target:'document'})())}`);
  console.log(`  Screen: ${Points.toString(positionFn(t, {target:'screen'})())}`);
  console.groupEnd();

  console.group('positionFn Rel');
  console.log(`Viewport: ${Points.toString(positionFn(t, {relative:true, target:'viewport'})() )}`);
  console.log(`Document: ${Points.toString(positionFn(t, {relative:true,target:'document'})())}`);
  console.log(`  Screen: ${Points.toString(positionFn(t, {relative:true,target:'screen'})())}`);
  console.groupEnd();

  console.group('cursor pointResolver');
  console.log(`Viewport: ${Points.toString(prVp(evt.clientX, evt.clientY))}`);
  console.log(`Document: ${Points.toString(prDoc(evt.pageX, evt.pageY))}`);
  console.log(`  Screen: ${Points.toString(prScreen(evt.screenX, evt.screenY))}`);
  console.groupEnd();
  console.log('----');

  t.classList.add('selected');
});

