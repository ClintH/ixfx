export type MarkerOpts = StrokeOpts &
  DrawingOpts & {
    readonly id: string;
    readonly markerWidth?: number;
    readonly markerHeight?: number;
    readonly orient?: string;
    readonly viewBox?: string;
    readonly refX?: number;
    readonly refY?: number;
  };

/**
* Drawing options
*/
export type DrawingOpts = {
  /**
   * Style for fill. Eg `black`.
   * @see [fill](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill)
   */
  readonly fillStyle?: string;

  /**
   * Opacity (0..1)
   */
  readonly opacity?: number;
  /**
   * If true, debug helpers are drawn
   */
  readonly debug?: boolean;
};

export type StrokeOpts = {
  /**
   * Line cap
   * @see [stroke-linecap](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-linecap)
   */
  readonly strokeLineCap?: `butt` | `round` | `square`;
  /**
   * Width of stroke, eg `2`
   * @see [stroke-width](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-width)
   */
  readonly strokeWidth?: number;
  /**
   * Stroke dash pattern, eg `5`
   * @see [stroke-dasharray](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray)
   */
  readonly strokeDash?: string;
  /**
   * Style for lines. Eg `white`.
   * @see [stroke](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke)
   */
  readonly strokeStyle?: string;
};

/**
 * Line drawing options
 */
export type LineDrawingOpts = DrawingOpts & MarkerDrawingOpts & StrokeOpts;

export type CircleDrawingOpts = DrawingOpts & StrokeOpts & MarkerDrawingOpts;

export type PathDrawingOpts = DrawingOpts & StrokeOpts & MarkerDrawingOpts;

export type MarkerDrawingOpts = {
  readonly markerEnd?: MarkerOpts;
  readonly markerStart?: MarkerOpts;
  readonly markerMid?: MarkerOpts;
};


/**
 * Text drawing options
 */
export type TextDrawingOpts = StrokeOpts &
  DrawingOpts & {
    readonly anchor?: `start` | `middle` | `end`;
    readonly align?:
    | `text-bottom`
    | `text-top`
    | `baseline`
    | `top`
    | `hanging`
    | `middle`;
    readonly userSelect?: boolean;
  };

/**
 * Text path drawing options
 */
export type TextPathDrawingOpts = TextDrawingOpts & {
  readonly method?: `align` | `stretch`;
  readonly side?: `left` | `right`;
  readonly spacing?: `auto` | `exact`;
  readonly startOffset?: number;
  readonly textLength?: number;
};