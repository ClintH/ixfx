import { Points } from "../geometry/index.js";

export type DragState = {
  readonly token?: object
  readonly initial: Points.Point
  readonly delta: Points.Point
}

type DragStart = {
  readonly allow: boolean
  readonly token: object
}
export type DragListener = {
  readonly start?: () => DragStart
  readonly progress?: (state: DragState) => boolean
  readonly abort?: (reason: string, state: DragState) => void
  readonly success?: (state: DragState) => void
}

export const draggable = (elem: SVGElement, listener: DragListener) => {
  //eslint-disable-next-line functional/no-let
  let initial = Points.Placeholder;
  //eslint-disable-next-line functional/no-let
  let token: object;

  // De-select if there's a click elsewhere
  const onParentClick = () => {
    const selected = elem.classList.contains(`drag-sel`);
    if (selected) {
      elem.classList.remove(`drag-sel`);
    }
  };

  // Click to select
  const onElementClick = (evt: MouseEvent) => {
    const selected = elem.classList.contains(`drag-sel`);
    if (selected) {
      elem.classList.remove(`drag-sel`);
    } else {
      elem.classList.add(`drag-sel`);
    }
    evt.stopPropagation();
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
    console.log(`drag dispose`);
    if (elem.classList.contains(`drag-progress`)) {
      onDragCancel(null, `dispose`);
    } else {
      dragCleanup();
    }
    elem.ownerDocument.removeEventListener(`click`, onParentClick);
    elem.removeEventListener(`click`, onElementClick);
  };

  // Dragging
  const onPointerMove = (e: PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const offset = Points.isPlaceholder(initial) ? { x: e.offsetX, y: e.offsetY } : {
      x: e.x - initial.x,
      y: e.y - initial.y
    };
    const state: DragState = {
      delta: offset,
      initial: initial,
      token
    };
    if (typeof listener.progress !== `undefined` && !listener.progress(state)) {
      onDragCancel(null, `discontinued`);
    }
  };

  // Done dragging
  const onPointerUp = (e: PointerEvent) => {
    dragCleanup();
    const offset = {
      x: e.x - initial.x,
      y: e.y - initial.y
    };
    const state: DragState = {
      initial: initial,
      token,
      delta: offset
    };
    if (typeof listener.success !== `undefined`) {
      listener.success(state);
    }
  };

  // Drag is cancelled
  const onDragCancel = (evt: PointerEvent | MouseEvent | null, reason: string = `pointercancel`) => {
    dragCleanup();
    const state: DragState = {
      token,
      initial: initial,
      delta: { x: -1, y: -1 }
    };
    if (typeof listener.abort !== `undefined`) {
      listener.abort(reason, state);
    }
  };

  elem.addEventListener(`pointerdown`, evt => {
    const selected = elem.classList.contains(`drag-sel`);
    if (!selected) return;

    initial = { x: evt.x, y: evt.y };
    const s = typeof listener.start !== `undefined` ? listener.start() : { allow: true, token };
    if (!s.allow) return;

    token = s.token;

    elem.classList.add(`drag-progress`);
    elem.ownerDocument.addEventListener(`pointermove`, onPointerMove);
    elem.ownerDocument.addEventListener(`pointerup`, onPointerUp);
    elem.ownerDocument.addEventListener(`pointercancel`, onDragCancel);
  });

  return dispose;
};
