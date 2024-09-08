import { clamp } from 'src/numbers/Clamp.js';
import { Points, Rects, type RectPositioned } from '../geometry/index.js';
import type { Point } from '../geometry/point/PointType.js'
import { resolveEl } from './ResolveEl.js';

/**
 * State of drag
 */
export type DragState = Readonly<{
  /**
   * Optional data, if this was given during drag start
   */
  token?: object
  /**
   * Initial pointer position in viewport coordinates
   */
  initial: Point
  /**
   * Delta of movement from initial position
   */
  delta: Point
  /**
   * Viewport-relative current position
   */
  viewport: Point
}>;

/**
 * Return data for `start` function
 */
export type DragStart = Readonly<{
  /**
   * If _true_, drag start is allowed
   */
  allow: boolean,
  /**
   * Optional data to associate with drag
   */
  token?: object
}>;

/**
 * Return data for `progress` function
 */
export type DragProgress = Readonly<{
  /**
   * If true, aborts drag operation
   */
  abort?: boolean
  /**
   * If returned, this will be viewport coordinates
   * to snap the drag to
   */
  viewport?: Point
}>

export type DragListener = Readonly<{
  start?: () => DragStart;
  progress?: (state: DragState) => DragProgress;
  abort?: (reason: string, state: DragState) => void;
  success?: (state: DragState) => void;
}>;

export type DragOptions = {
  autoTranslate: boolean
  /**
   * If true, it's not necessary to select item first
   */
  quickDrag: boolean
  fence: HTMLElement | string
  fenceViewport: RectPositioned
}

//eslint-disable-next-line functional/prefer-immutable-types
export const draggable = (elemOrQuery: SVGElement | HTMLElement | string, listener: DragListener, options: Partial<DragOptions> = {}) => {
  const elem = resolveEl(elemOrQuery);

  /**
   * Viewport location at drag start
   */
  let initialPointerPosition = Points.Placeholder;
  let token: object | undefined;
  const autoTranslate = options.autoTranslate ?? false;
  const quickDrag = options.quickDrag ?? false;
  const fence = options.fence ? resolveEl(options.fence) : undefined;
  const fenceViewport = options.fenceViewport;
  let fenceOffset = Rects.PlaceholderPositioned;
  const relativePosition = window.getComputedStyle(elem).position === `relative`;

  // De-select if there's a click elsewhere
  const onParentClick = () => {
    const selected = elem.classList.contains(`drag-sel`);
    if (selected) {
      elem.classList.remove(`drag-sel`);
    }
  };

  // Click to select
  const onElementClick = (event: Event) => {
    const selected = elem.classList.contains(`drag-sel`);
    if (selected) {
      elem.classList.remove(`drag-sel`);
    } else {
      elem.classList.add(`drag-sel`);
    }
    event.stopPropagation();
  };

  elem.ownerDocument.addEventListener(`click`, onParentClick);
  elem.addEventListener(`click`, onElementClick);

  // Remove event handlers
  const dragCleanup = () => {
    elem.classList.remove(`drag-progress`);

    elem.ownerDocument.removeEventListener(`pointermove`, onPointerMove);
    elem.ownerDocument.removeEventListener(`pointerup`, onPointerUp);
    elem.ownerDocument.removeEventListener(`pointercancel`, onDragCancel);
  };

  const dispose = () => {
    if (elem.classList.contains(`drag-progress`)) {
      onDragCancel(undefined, `dispose`);
    } else {
      dragCleanup();
    }
    elem.ownerDocument.removeEventListener(`click`, onParentClick);
    elem.removeEventListener(`click`, onElementClick);
  };

  const validateOffsetAndPoint = (offset: Point, x: number, y: number): [ offset: Point, viewport: Point ] => {
    if (!Rects.isPlaceholder(fenceOffset)) {
      offset = {
        x: clamp(offset.x, fenceOffset.x, fenceOffset.width),
        y: clamp(offset.y, fenceOffset.y, fenceOffset.height)
      }
      if (fenceViewport) {
        x = clamp(x, fenceViewport.x, fenceViewport.x + fenceViewport.width);
        y = clamp(y, fenceViewport.y, fenceViewport.y + fenceViewport.height);
      }
    }

    return [ offset, { x, y } ];
  }

  // Dragging
  let lastMoveOffset: Point = Points.Empty;
  const onPointerMove = (moveEvent: PointerEvent) => {
    moveEvent.preventDefault();
    moveEvent.stopPropagation();

    let { x, y } = moveEvent;
    let offset = Points.isPlaceholder(initialPointerPosition)
      ? { x: moveEvent.offsetX, y: moveEvent.offsetY }
      : {
        x: x - initialPointerPosition.x,
        y: y - initialPointerPosition.y,
      };

    const r = validateOffsetAndPoint(offset, x, y);
    offset = r[ 0 ];

    const state: DragState = {
      delta: offset,
      initial: initialPointerPosition,
      token,
      viewport: r[ 1 ]
    };

    if (typeof listener.progress !== `undefined`) {
      const p = listener.progress(state);
      if (p.abort) return onDragCancel(undefined, `discontinued`);
      if (p.viewport) {
        offset = {
          x: p.viewport.x - initialPointerPosition.x,
          y: p.viewport.y - initialPointerPosition.y
        }
      }
    }
    lastMoveOffset = offset;
    if (autoTranslate) {
      let offsetX = offset.x;
      let offsetY = offset.y;

      elem.style.translate = `${ offsetX }px ${ offsetY }px`;
    }
  };

  // Done dragging
  const onPointerUp = (upEvent: PointerEvent) => {
    const bounds = elem.getBoundingClientRect();

    dragCleanup();
    let { x, y } = upEvent;
    // let offset = {
    //   x: upEvent.x - initialPointerPosition.x,
    //   y: upEvent.y - initialPointerPosition.y,
    // };

    const r = validateOffsetAndPoint(lastMoveOffset, x, y);

    const state: DragState = {
      initial: initialPointerPosition,
      token,
      delta: r[ 0 ],
      viewport: r[ 1 ]
    };
    if (autoTranslate) {
      elem.style.translate = `none`;
      if (relativePosition) {
        const parent = elem.parentElement?.getBoundingClientRect() as DOMRect;
        elem.style.left = `${ bounds.x - parent.left }px`;
        elem.style.top = `${ bounds.y - parent.top }px`;
      } else {
        elem.style.left = `${ bounds.x }px`;
        elem.style.top = `${ bounds.y }px`;
      }
    }

    if (typeof listener.success !== `undefined`) {
      listener.success(state);
    }
  };

  // Drag is cancelled
  const onDragCancel = (
    //eslint-disable-next-line functional/prefer-immutable-types
    event: PointerEvent | MouseEvent | undefined,
    reason = `pointercancel`
  ) => {
    dragCleanup();

    let viewport = Points.Placeholder;
    if (event && `x` in event && `y` in event) {
      viewport = { x: (event as MouseEvent).x, y: (event as MouseEvent).y }
    }
    const state: DragState = {
      token,
      initial: initialPointerPosition,
      delta: { x: -1, y: -1 },
      viewport
    };
    if (typeof listener.abort !== `undefined`) {
      listener.abort(reason, state);
    }
  };

  elem.addEventListener(`pointerdown`, (event) => {
    const selected = elem.classList.contains(`drag-sel`);
    if (!selected && !quickDrag) return;
    const evt = event as PointerEvent;
    initialPointerPosition = { x: evt.x, y: evt.y };
    const s =
      typeof listener.start === `undefined`
        ? { allow: true, token }
        : listener.start();
    if (!s.allow) return;

    token = s.token;
    if (fence) {
      const fenceBounds = fence.getBoundingClientRect();
      fenceOffset = {
        x: fenceBounds.x - initialPointerPosition.x,
        y: fenceBounds.y - initialPointerPosition.y,
        width: fenceBounds.x + fenceBounds.width - initialPointerPosition.x,
        height: fenceBounds.y + fenceBounds.height - initialPointerPosition.y,
      }
    } else if (fenceViewport) {
      fenceOffset = {
        x: fenceViewport.x - initialPointerPosition.x,
        y: fenceViewport.y - initialPointerPosition.y,
        width: (fenceViewport.width + fenceViewport.x) - initialPointerPosition.x,
        height: (fenceViewport.height + fenceViewport.y) - initialPointerPosition.y
      }
    }
    elem.classList.add(`drag-progress`);
    elem.ownerDocument.addEventListener(`pointermove`, onPointerMove);
    elem.ownerDocument.addEventListener(`pointerup`, onPointerUp);
    elem.ownerDocument.addEventListener(`pointercancel`, onDragCancel);
  });

  return dispose;
};
