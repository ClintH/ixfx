
import { PointsTracker } from '@ixfx/geometry/point';
import * as Svg from './svg/index.js';
import { ElementSizer, resolveEl } from '@ixfx/dom';
export type Opts = {
  readonly touchRadius?: number;
  readonly mouseRadius?: number;
  readonly trace?: boolean;
  readonly hue?: number;
};

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
 * @param elOrQuery Element to monitor
 * @param options Options
 */
export const pointerVisualise = (
  elOrQuery: HTMLElement | string,
  options: Opts = {}
) => {
  const touchRadius = options.touchRadius ?? 45;
  const mouseRadius = options.touchRadius ?? 20;
  const trace = options.trace ?? false;
  const hue = options.hue ?? 100;

  const startFillStyle = `hsla(${ hue }, 100%, 10%, 10%)`;
  let currentHue = hue;

  const el = resolveEl(elOrQuery);
  const tracker = new PointsTracker({
    storeIntermediate: trace,
  });


  const svg = document.createElementNS(
    `http://www.w3.org/2000/svg`,
    `svg`
  ) as any as SVGElement & HTMLElement;
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

  // const er = new ElementSizer(svg, {
  //   containerEl:document.body,
  //   stretch:`both`,
  //   onSetSize(size) {
  //     svg.setAttribute(`width`, size.width.toString());
  //     svg.setAttribute(`height`, size.height.toString());
  //   },
  // })
  const er = ElementSizer.svgViewport(svg);
  //fullSizeElement(svg);
  let pointerCount = 0;

  const lostPointer = (event: PointerEvent) => {
    const id = event.pointerId.toString();

    tracker.delete(id);
    currentHue = hue;
    svg.querySelector(`#pv-start-${ id }`)?.remove();

    for (let index = 0; index < pointerCount + 10; index++) {
      svg.querySelector(`#pv-progress-${ id }-${ index }`)?.remove();
    }
    pointerCount = 0;
  };

  const trackPointer = async (event: PointerEvent) => {
    const id = event.pointerId.toString();
    const pt = { x: event.x, y: event.y };
    const type = event.pointerType;
    if (event.type === `pointermove` && !tracker.has(id)) {
      return;
    }
    const info = (await tracker.seen(event.pointerId.toString(), { x: event.clientX, y: event.clientY }));

    if (info.values.length === 1) {
      const el = Svg.Elements.circle(
        {
          ...info.values[ 0 ],
          radius: type === `touch` ? touchRadius : mouseRadius,
        },
        svg,
        {
          fillStyle: startFillStyle,
        },
        `#pv-start-${ id }`
      );
      el.style.pointerEvents = `none`;
      el.style.touchAction = `none`;
    }

    const fillStyle = `hsla(${ currentHue }, 100%, 50%, 50%)`;

    const el2 = Svg.Elements.circle(
      { ...pt, radius: type === `touch` ? touchRadius : mouseRadius },
      svg,
      {
        fillStyle,
      },
      `#pv-progress-${ id }-${ info.values.length }`
    );
    el2.style.pointerEvents = `none`;
    el2.style.touchAction = `none`;
    currentHue += 1;
    pointerCount = info.values.length;
  };

  document.body.append(svg);


  el.addEventListener(`pointerdown`, trackPointer);

  el.addEventListener(`pointermove`, trackPointer);
  el.addEventListener(`pointerup`, lostPointer);
  el.addEventListener(`pointerleave`, lostPointer);
  el.addEventListener(`contextmenu`, (event) => {
    event.preventDefault();
  });
};
