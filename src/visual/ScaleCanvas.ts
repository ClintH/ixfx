import { resolveEl } from "../dom/ResolveEl.js";

/**
 * Scales a canvas to account for retina displays.
 * 
 * ```js
 * const r = scaleCanvas(`#my-canvas`);
 * r.ctx;      // CanvasRendering2D
 * r.element;  // HTMLCanvasElement
 * r.bounds;   // {x:number,y:number,width:number,height:number}
 * ```
 * 
 * Eg:
 * ```js
 * const { ctx } = scaleCanvas(`#my-canvas`);
 * ctx.fillStyle = `red`;
 * ctx.fillRect(0,0,100,100);
 * ```
 * 
 * Throws an error if `domQueryOrElement` does not resolve.w
 * @param domQueryOrElement 
 * @returns 
 */
export const scaleCanvas = (domQueryOrElement: HTMLCanvasElement | string) => {
  const canvasElement = resolveEl<HTMLCanvasElement>(domQueryOrElement);
  const ratio = window.devicePixelRatio;
  canvasElement.style.width = canvasElement.width + `px`;
  canvasElement.style.height = canvasElement.height + `px`;
  canvasElement.width *= devicePixelRatio;
  canvasElement.height *= devicePixelRatio;

  const getContext = () => {
    const ctx = canvasElement.getContext(`2d`);

    if (ctx === null) throw new Error(`Could not get drawing context`);
    ctx.save();
    ctx.scale(ratio, ratio);
    return ctx;
  }
  return { ctx: getContext(), element: canvasElement, bounds: canvasElement.getBoundingClientRect() };
}