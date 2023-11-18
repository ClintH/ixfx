import type { Point } from '../geometry/Types.js';
import { Points } from '../geometry/index.js';

export type DragState = {
  readonly token?: object;
  readonly initial: Point;
  readonly delta: Point;
};

export type DragStart = {
  readonly allow: boolean;
  readonly token: object;
};
export type DragListener = {
  readonly start?: () => DragStart;
  readonly progress?: (state: DragState) => boolean;
  readonly abort?: (reason: string, state: DragState) => void;
  readonly success?: (state: DragState) => void;
};

//eslint-disable-next-line functional/prefer-immutable-types
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
  //eslint-disable-next-line functional/prefer-immutable-types
  const onElementClick = (event: MouseEvent) => {
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
    console.log(`drag dispose`);
    if (elem.classList.contains(`drag-progress`)) {
      onDragCancel(undefined, `dispose`);
    } else {
      dragCleanup();
    }
    elem.ownerDocument.removeEventListener(`click`, onParentClick);
    elem.removeEventListener(`click`, onElementClick);
  };

  // Dragging
  //eslint-disable-next-line functional/prefer-immutable-types
  const onPointerMove = (moveEvent: PointerEvent) => {
    moveEvent.preventDefault();
    moveEvent.stopPropagation();

    const offset = Points.isPlaceholder(initial)
      ? { x: moveEvent.offsetX, y: moveEvent.offsetY }
      : {
        x: moveEvent.x - initial.x,
        y: moveEvent.y - initial.y,
      };
    const state: DragState = {
      delta: offset,
      initial: initial,
      token,
    };
    if (typeof listener.progress !== `undefined` && !listener.progress(state)) {
      onDragCancel(undefined, `discontinued`);
    }
  };

  // Done dragging
  //eslint-disable-next-line functional/prefer-immutable-types
  const onPointerUp = (upEvent: PointerEvent) => {
    dragCleanup();
    const offset = {
      x: upEvent.x - initial.x,
      y: upEvent.y - initial.y,
    };
    const state: DragState = {
      initial: initial,
      token,
      delta: offset,
    };
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
    const state: DragState = {
      token,
      initial: initial,
      delta: { x: -1, y: -1 },
    };
    if (typeof listener.abort !== `undefined`) {
      listener.abort(reason, state);
    }
  };

  elem.addEventListener(`pointerdown`, (event) => {
    const selected = elem.classList.contains(`drag-sel`);
    if (!selected) return;

    initial = { x: event.x, y: event.y };
    const s =
      typeof listener.start === `undefined`
        ? { allow: true, token }
        : listener.start();
    if (!s.allow) return;

    token = s.token;

    elem.classList.add(`drag-progress`);
    elem.ownerDocument.addEventListener(`pointermove`, onPointerMove);
    elem.ownerDocument.addEventListener(`pointerup`, onPointerUp);
    elem.ownerDocument.addEventListener(`pointercancel`, onDragCancel);
  });

  return dispose;
};
