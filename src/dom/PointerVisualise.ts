/* eslint-disable functional/immutable-data */
import { PointTrackerResults, pointsTracker} from "../data/PointTracker.js";
import {fullSizeElement, resolveEl} from "./Util.js";
import * as Svg from "../visual/Svg.js";

export type Opts = {
  readonly touchRadius?:number
  readonly mouseRadius?:number
  readonly trace?:boolean
  readonly hue?:number
}

/**
 * Visualises pointer events within a given element.
 * 
 * ```js
 * // Show pointer events for whole document
 * pointerVis(document);
 * ```
 * 
 * Note you may need to set the following CSS properties on the target element:
 * 
 * ```css
 * touch-action: none;
 * user-select: none;
 * overscroll-behavior: none;
 * ```
 * 
 * Options
 * * touchRadius/mouseRadius: size of circle for these kinds of pointer events
 * * trace: if true, intermediate events are captured and displayed
 * @param elOrQuery 
 * @param opts 
 */
export const pointerVisualise = (elOrQuery: HTMLElement | string, opts:Opts = {}) => {
  const touchRadius = opts.touchRadius ?? 45;
  const mouseRadius = opts.touchRadius ?? 20;
  const trace = opts.trace ?? false;
  const hue = opts.hue ?? 100;

  const startFillStyle =`hsla(${hue}, 100%, 10%, 10%)`;

  //eslint-disable-next-line functional/no-let
  let currentHue = hue;

  const el = resolveEl(elOrQuery);
  const tracker = pointsTracker({
    storeIntermediate:trace
  });  

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  const svg = (document.createElementNS(`http://www.w3.org/2000/svg`, `svg`) as any) as SVGElement & HTMLElement;
  svg.id = `pointerVis`;
  svg.style.zIndex = `-1000`;
  svg.style.position = `fixed`;
  svg.style.top = `0`;
  svg.style.left = `0`;
  svg.style.width = `100%`;
  svg.style.height = `100%`;
  svg.style.boxSizing = `border-box`;
  svg.style.border = `3px solid red`;
  svg.style.pointerEvents = `none`;
  svg.style.touchAction = `none`;

  fullSizeElement(svg);
  //eslint-disable-next-line functional/no-let
  let pointerCount = 0;

  const lostPointer = async (ev:PointerEvent) => {
    const id = ev.pointerId.toString();
    tracker.delete(id);
    currentHue = hue;
    svg.querySelector(`#pv-start-${id}`)?.remove();

    //eslint-disable-next-line functional/no-loop-statement,functional/no-let
    for (let i=0;i<pointerCount+10;i++) {
      svg.querySelector(`#pv-progress-${id}-${i}`)?.remove();
    }
    pointerCount = 0;

  };

  const trackPointer = async (ev:PointerEvent) => {
    const id = ev.pointerId.toString();
    const pt = {x: ev.x, y: ev.y};
    const type = ev.pointerType;
    if (ev.type ===`pointermove` && !tracker.has(id)) {
      return;
    }
    const info = await tracker.seen(id, pt) as PointTrackerResults;

    if (info.values.length === 1) {
      const el = Svg.Elements.circle({...info.values[0], radius: (type === `touch` ? touchRadius : mouseRadius)}, svg, {
        fillStyle: startFillStyle,
      }, `#pv-start-${id}`);
      el.style.pointerEvents = `none`;
      el.style.touchAction = `none`;

    }

    const progressFillStyle = `hsla(${currentHue}, 100%, 50%, 50%)`;
    
    const el2 = Svg.Elements.circle({...pt, radius: (type === `touch` ? touchRadius : mouseRadius)}, svg, {
      fillStyle: progressFillStyle
    }, `#pv-progress-${id}-${info.values.length}`);
    el2.style.pointerEvents = `none`;
    el2.style.touchAction =`none`;
    currentHue +=1;
    pointerCount = info.values.length;
    return true;
  };

  document.body.appendChild(svg);

  el.addEventListener(`pointerdown`, trackPointer);
  el.addEventListener(`pointermove`, trackPointer);
  el.addEventListener(`pointerup`, lostPointer);
  el.addEventListener(`pointerleave`, lostPointer);
  el.addEventListener(`contextmenu`, ev => {
    ev.preventDefault();
  });
};