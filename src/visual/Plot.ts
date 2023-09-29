// /* eslint-disable @typescript-eslint/no-unused-vars */
// import type { Circle, CirclePositioned } from '../geometry/Circle.js';
// import * as Pipes from '../data/pipes/index.js';
// import { Drawing, SceneGraph } from './index.js';
// import type { RectPositioned } from '../geometry/Rect.js';
// import type { BoxRect } from './SceneGraph.js';

// export const scalarCanvasPlot = (canvasElement: HTMLCanvasElement, desiredRegion: BoxRect | RectPositioned) => {
//   const box = new SceneGraph.CanvasBox(undefined, `scalarPlot`);
//   const desiredBox = (typeof desiredRegion.height === `number`) ? SceneGraph.boxRectFromRectPx(desiredRegion as RectPositioned) : desiredRegion as BoxRect;

//   box.desiredRegion = desiredBox;
//   box.debugLayout = true;

//   const data = scalarPlotData();

//   const yAxis = new SceneGraph.CanvasBox(box, `axis-y`);//, { x: region.x, y: region.y, width: 100, height: region.height });
//   yAxis.desiredRegion = {
//     ...desiredBox,
//     width: { type: `px`, value: 10 }
//   }
//   yAxis.debugLayout = true;

//   return {
//     ...data,
//     draw: (ctx: CanvasRenderingContext2D, force: boolean) => {
//       box.update(ctx, false);
//       box.draw(ctx, force);
//     }
//   }
// };

// // class ScalarCanvasPlot {
// // }
// /**
//  * Continuous plotter of single scalars
//  * @returns 
//  */
// export const scalarPlotData = <InputType>() => {
//   //const windowSize = Pipes.number(10);

//   // const [ tail, head ] = Pipes.chain(
//   //   Pipes.slidingWindow(windowSize)
//   // );

//   // return {
//   //   add: (series: string, value: InputType) => {
//   //     head.inlet(value);
//   //   }
//   // }

//   // const normalisedStream = Pipes.bidiWrapped<InputType>()
//   //   .slidingWindow(windowSize)

//   // // Input stream -> normalised
//   // const inputStream = Pipes.bidi<InputType>();
//   // Pipes.connect<any>(inputStream, normalisedStream);

//   return {}
//   // return {
//   //   add: (series: string, value: InputType) => {
//   //     inputStream.inlet(value);
//   //   }
//   // }
// }

