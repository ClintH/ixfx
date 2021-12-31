declare const pointToString: (p: Point) => string;
declare const guard$2: (p: Point, name?: string) => void;
declare const toArray: (p: Point) => number[];
declare const equals: (a: Point, b: Point) => boolean;
declare function from(x: number, y: number): Point;
declare function from(array: number[]): Point;
declare const diff: (a: Point, b: Point) => Point;
declare const sum: (a: Point, b: Point) => Point;
declare function multiply(a: Point, b: Point): Point;
declare function multiply(a: Point, x: number, y?: number): Point;
declare type Point = {
    readonly x: number;
    readonly y: number;
    readonly z?: number;
};

declare const Point$1_pointToString: typeof pointToString;
declare const Point$1_toArray: typeof toArray;
declare const Point$1_equals: typeof equals;
declare const Point$1_from: typeof from;
declare const Point$1_diff: typeof diff;
declare const Point$1_sum: typeof sum;
declare const Point$1_multiply: typeof multiply;
type Point$1_Point = Point;
declare namespace Point$1 {
  export {
    Point$1_pointToString as pointToString,
    guard$2 as guard,
    Point$1_toArray as toArray,
    Point$1_equals as equals,
    Point$1_from as from,
    Point$1_diff as diff,
    Point$1_sum as sum,
    Point$1_multiply as multiply,
    Point$1_Point as Point,
  };
}

declare type Rect = {
    readonly width: number;
    readonly height: number;
    readonly x: number;
    readonly y: number;
};
declare const fromCenter: (origin: Point, width: number, height: number) => Rect;
declare const guard$1: (rect: Rect, name?: string) => void;
declare const fromTopLeft: (origin: Point, width: number, height: number) => Rect;
declare const getCorners: (rect: Rect) => Point[];
declare const getCenter: (rect: Rect) => Point;

type Rect$1_Rect = Rect;
declare const Rect$1_fromCenter: typeof fromCenter;
declare const Rect$1_fromTopLeft: typeof fromTopLeft;
declare const Rect$1_getCorners: typeof getCorners;
declare const Rect$1_getCenter: typeof getCenter;
declare namespace Rect$1 {
  export {
    Rect$1_Rect as Rect,
    Rect$1_fromCenter as fromCenter,
    guard$1 as guard,
    Rect$1_fromTopLeft as fromTopLeft,
    Rect$1_getCorners as getCorners,
    Rect$1_getCenter as getCenter,
  };
}

declare type Path = {
    length(): number;
    compute(t: number): Point;
    bbox(): Rect;
    toString(): string;
};
declare const getStart: (path: Path) => Point;
declare const getEnd: (path: Path) => Point;

type Path$1_Path = Path;
declare const Path$1_getStart: typeof getStart;
declare const Path$1_getEnd: typeof getEnd;
declare namespace Path$1 {
  export {
    Path$1_Path as Path,
    Path$1_getStart as getStart,
    Path$1_getEnd as getEnd,
  };
}

declare type Line = Path & {
    readonly a: Point;
    readonly b: Point;
};
declare function length(a: Point, b: Point): number;
declare function compute(a: Point, b: Point, t: number): Point;
declare function bbox(...points: Point[]): Rect;
declare function toString$1(a: Point, b: Point): string;
declare function fromNumbers(x1: number, y1: number, x2: number, y2: number): Line;
declare function fromPoints(a: Point, b: Point): Line;

type Line$1_Line = Line;
declare const Line$1_length: typeof length;
declare const Line$1_compute: typeof compute;
declare const Line$1_bbox: typeof bbox;
declare const Line$1_fromNumbers: typeof fromNumbers;
declare const Line$1_fromPoints: typeof fromPoints;
declare namespace Line$1 {
  export {
    Line$1_Line as Line,
    Line$1_length as length,
    Line$1_compute as compute,
    Line$1_bbox as bbox,
    toString$1 as toString,
    Line$1_fromNumbers as fromNumbers,
    Line$1_fromPoints as fromPoints,
  };
}

declare type QuadraticBezier = Path & {
    a: Point;
    b: Point;
    quadratic: Point;
};
declare const quadraticBend: (b: QuadraticBezier, bend?: number) => QuadraticBezier;
declare const quadraticSimple: (start: Point, end: Point, bend?: number) => QuadraticBezier;
declare const quadratic: (start: Point, end: Point, handle: Point) => QuadraticBezier;

type Bezier_QuadraticBezier = QuadraticBezier;
declare const Bezier_quadraticBend: typeof quadraticBend;
declare const Bezier_quadraticSimple: typeof quadraticSimple;
declare const Bezier_quadratic: typeof quadratic;
declare namespace Bezier {
  export {
    Bezier_QuadraticBezier as QuadraticBezier,
    Bezier_quadraticBend as quadraticBend,
    Bezier_quadraticSimple as quadraticSimple,
    Bezier_quadratic as quadratic,
  };
}

declare type MultiPath = Path & {
    segments: Path[];
};
declare const setSegment: (multiPath: MultiPath, index: number, path: Path) => MultiPath;
declare const toString: (paths: Path[]) => string;
declare const guardContinuous: (paths: Path[]) => void;
declare const fromPaths: (...paths: Path[]) => MultiPath;

type MultiPath$1_MultiPath = MultiPath;
declare const MultiPath$1_setSegment: typeof setSegment;
declare const MultiPath$1_toString: typeof toString;
declare const MultiPath$1_guardContinuous: typeof guardContinuous;
declare const MultiPath$1_fromPaths: typeof fromPaths;
declare namespace MultiPath$1 {
  export {
    MultiPath$1_MultiPath as MultiPath,
    MultiPath$1_setSegment as setSegment,
    MultiPath$1_toString as toString,
    MultiPath$1_guardContinuous as guardContinuous,
    MultiPath$1_fromPaths as fromPaths,
  };
}

declare type Listener<Events> = (ev: any, sender: SimpleEventEmitter<Events>) => void;
declare class SimpleEventEmitter<Events> {
    #private;
    protected fireEvent<K extends keyof Events>(type: K, args: Events[K]): void;
    addEventListener<K extends keyof Events>(type: K, listener: (ev: Events[K], sender: SimpleEventEmitter<Events>) => void): void;
    removeEventListener<K extends keyof Events>(type: K, listener: Listener<Events>): void;
    clearEventListeners(): void;
}

declare type KeyString<V> = (a: V) => string;
declare type MutableValueSetEventMap<V> = {
    add: {
        value: V;
        updated: boolean;
    };
    clear: boolean;
    delete: V;
};
declare class MutableValueSet<V> extends SimpleEventEmitter<MutableValueSetEventMap<V>> {
    store: Map<string, V>;
    keyString: KeyString<V>;
    constructor(keyString?: KeyString<V> | undefined);
    add(...v: V[]): void;
    values(): IterableIterator<V>;
    clear(): void;
    delete(v: V): boolean;
    has(v: V): boolean;
    toArray(): V[];
}

type Sets_MutableValueSet<V> = MutableValueSet<V>;
declare const Sets_MutableValueSet: typeof MutableValueSet;
declare namespace Sets {
  export {
    Sets_MutableValueSet as MutableValueSet,
  };
}

declare enum CardinalDirection {
    None = 0,
    North = 1,
    NorthEast = 2,
    East = 3,
    SouthEast = 4,
    South = 5,
    SouthWest = 6,
    West = 7,
    NorthWest = 8
}
declare enum WrapLogic {
    None = 0,
    Wrap = 1
}
declare type GridVisual = {
    size: number;
};
declare type Grid = {
    rows: number;
    cols: number;
};
declare type Cell = {
    x: number;
    y: number;
};
declare const cellKeyString: (v: Cell) => string;
declare const cellEquals: (a: Cell, b: Cell) => boolean;
declare const guard: (a: Cell, paramName?: string) => void;
declare const cellCornerRect: (cell: Cell, grid: Grid & GridVisual) => Rect;
declare const getCell: (position: Point, grid: Grid & GridVisual) => Cell | undefined;
declare const neighbours: (grid: Grid, cell: Cell, bounds?: BoundsLogic) => Cell[];
declare const cellMiddle: (cell: Cell, grid: Grid & GridVisual) => Point;
declare const getLine: (start: Cell, end: Cell) => Cell[];
declare const getSquarePerimeter: (grid: Grid, steps: number, start?: Cell, bounds?: BoundsLogic) => Cell[];
declare const getVectorFromCardinal: (cardinal: CardinalDirection, multiplier?: number) => Cell;
declare enum BoundsLogic {
    Unbound = 0,
    Undefined = 1,
    Stop = 2,
    Wrap = 3
}
declare const simpleLine: (start: Cell, end: Cell, endInclusive?: boolean) => Cell[];
declare const offset: (grid: Grid, vector: Cell, start?: Cell, bounds?: BoundsLogic) => Cell | undefined;
declare const offsetStepsByRow: (grid: Grid, steps: number, start?: Cell, bounds?: BoundsLogic) => Cell | undefined;
declare const offsetStepsByCol: (grid: Grid, steps: number, start?: Cell, bounds?: BoundsLogic) => Cell | undefined;
declare const walkByFn: (offsetFn: (grid: Grid, steps: number, start: Cell, bounds: BoundsLogic) => Cell | undefined, grid: Grid, start?: Cell, wrap?: boolean) => Iterable<Cell>;
declare const walkByRow: (grid: Grid, start?: Cell, wrap?: boolean) => Iterable<Cell>;
declare const walkByCol: (grid: Grid, start?: Cell, wrap?: boolean) => Iterable<Cell>;
declare const visitorDepth: (queue: Cell[]) => Cell;
declare const visitorBreadth: (queue: Cell[]) => Cell;
declare const visitorRandom: (queue: Cell[]) => Cell;
declare const visitor: (visitFn: (nbos: Cell[]) => Cell, grid: Grid, start: Cell, visited?: MutableValueSet<Cell> | undefined) => Iterable<Cell>;

type Grid$1_CardinalDirection = CardinalDirection;
declare const Grid$1_CardinalDirection: typeof CardinalDirection;
type Grid$1_WrapLogic = WrapLogic;
declare const Grid$1_WrapLogic: typeof WrapLogic;
type Grid$1_GridVisual = GridVisual;
type Grid$1_Grid = Grid;
type Grid$1_Cell = Cell;
declare const Grid$1_cellKeyString: typeof cellKeyString;
declare const Grid$1_cellEquals: typeof cellEquals;
declare const Grid$1_guard: typeof guard;
declare const Grid$1_cellCornerRect: typeof cellCornerRect;
declare const Grid$1_getCell: typeof getCell;
declare const Grid$1_neighbours: typeof neighbours;
declare const Grid$1_cellMiddle: typeof cellMiddle;
declare const Grid$1_getLine: typeof getLine;
declare const Grid$1_getSquarePerimeter: typeof getSquarePerimeter;
declare const Grid$1_getVectorFromCardinal: typeof getVectorFromCardinal;
type Grid$1_BoundsLogic = BoundsLogic;
declare const Grid$1_BoundsLogic: typeof BoundsLogic;
declare const Grid$1_simpleLine: typeof simpleLine;
declare const Grid$1_offset: typeof offset;
declare const Grid$1_offsetStepsByRow: typeof offsetStepsByRow;
declare const Grid$1_offsetStepsByCol: typeof offsetStepsByCol;
declare const Grid$1_walkByFn: typeof walkByFn;
declare const Grid$1_walkByRow: typeof walkByRow;
declare const Grid$1_walkByCol: typeof walkByCol;
declare const Grid$1_visitorDepth: typeof visitorDepth;
declare const Grid$1_visitorBreadth: typeof visitorBreadth;
declare const Grid$1_visitorRandom: typeof visitorRandom;
declare const Grid$1_visitor: typeof visitor;
declare namespace Grid$1 {
  export {
    Grid$1_CardinalDirection as CardinalDirection,
    Grid$1_WrapLogic as WrapLogic,
    Grid$1_GridVisual as GridVisual,
    Grid$1_Grid as Grid,
    Grid$1_Cell as Cell,
    Grid$1_cellKeyString as cellKeyString,
    Grid$1_cellEquals as cellEquals,
    Grid$1_guard as guard,
    Grid$1_cellCornerRect as cellCornerRect,
    Grid$1_getCell as getCell,
    Grid$1_neighbours as neighbours,
    Grid$1_cellMiddle as cellMiddle,
    Grid$1_getLine as getLine,
    Grid$1_getSquarePerimeter as getSquarePerimeter,
    Grid$1_getVectorFromCardinal as getVectorFromCardinal,
    Grid$1_BoundsLogic as BoundsLogic,
    Grid$1_simpleLine as simpleLine,
    Grid$1_offset as offset,
    Grid$1_offsetStepsByRow as offsetStepsByRow,
    Grid$1_offsetStepsByCol as offsetStepsByCol,
    Grid$1_walkByFn as walkByFn,
    Grid$1_walkByRow as walkByRow,
    Grid$1_walkByCol as walkByCol,
    Grid$1_visitorDepth as visitorDepth,
    Grid$1_visitorBreadth as visitorBreadth,
    Grid$1_visitorRandom as visitorRandom,
    Grid$1_visitor as visitor,
  };
}

declare type DadsrEnvelopeOpts = StageOpts & {
    sustainLevel?: number;
    attackBend?: number;
    decayBend?: number;
    releaseBend?: number;
};
declare const dadsr: (opts?: DadsrEnvelopeOpts) => Readonly<Envelope>;

declare type StageOpts = {
    timerSource?: TimerSource;
    looping?: boolean;
    delayDuration?: number;
    attackDuration?: number;
    decayDuration?: number;
    releaseDuration?: number;
};
declare enum Stage {
    Stopped = 0,
    Delay = 1,
    Attack = 2,
    Decay = 3,
    Sustain = 4,
    Release = 5
}
declare type Envelope = {
    getStage: (stage: Stage) => {
        duration: number;
    };
    trigger(): void;
    reset(): void;
    hold(): void;
    release(): void;
    compute(): [Stage, number];
};
declare type Timer = {
    reset(): void;
    elapsed(): number;
};
declare type TimerSource = () => Timer;
declare const stages: (opts?: StageOpts) => Readonly<Envelope>;

declare const Envelope$1_dadsr: typeof dadsr;
type Envelope$1_StageOpts = StageOpts;
type Envelope$1_Stage = Stage;
declare const Envelope$1_Stage: typeof Stage;
type Envelope$1_Envelope = Envelope;
declare const Envelope$1_stages: typeof stages;
declare namespace Envelope$1 {
  export {
    Envelope$1_dadsr as dadsr,
    Envelope$1_StageOpts as StageOpts,
    Envelope$1_Stage as Stage,
    Envelope$1_Envelope as Envelope,
    Envelope$1_stages as stages,
  };
}

declare const timer: (easingName: string, durationMs: number) => Easing;
declare const tick: (easingName: string, durationTicks: number) => Easing;
declare type Easing = {
    compute(): number;
    reset(): void;
    isDone(): boolean;
};
declare const getEasings: () => string[];

declare const Easing$1_timer: typeof timer;
declare const Easing$1_tick: typeof tick;
type Easing$1_Easing = Easing;
declare const Easing$1_getEasings: typeof getEasings;
declare namespace Easing$1 {
  export {
    Easing$1_timer as timer,
    Easing$1_tick as tick,
    Easing$1_Easing as Easing,
    Easing$1_getEasings as getEasings,
  };
}

declare class Circular<V> extends Array {
    #private;
    constructor(capacity: number);
    add(thing: V): Circular<V>;
}
declare class Lifo<V> extends Array {
    #private;
    constructor(capacity?: number);
    add(thing: V): Lifo<V>;
    peek(): V;
    removeLast(): Lifo<V>;
    remove(): Lifo<V>;
}
declare class Fifo<V> extends Array {
    #private;
    constructor(capacity?: number);
    static create<V>(capacity: number, data: Array<V>): Fifo<V>;
    add(thing: V): Fifo<V>;
    peek(): V;
    remove(): Fifo<V>;
}

type Lists_Circular<V> = Circular<V>;
declare const Lists_Circular: typeof Circular;
type Lists_Lifo<V> = Lifo<V>;
declare const Lists_Lifo: typeof Lifo;
type Lists_Fifo<V> = Fifo<V>;
declare const Lists_Fifo: typeof Fifo;
declare namespace Lists {
  export {
    Lists_Circular as Circular,
    Lists_Lifo as Lifo,
    Lists_Fifo as Fifo,
  };
}

declare class BasePlot {
    canvasEl: HTMLCanvasElement;
    precision: number;
    paused: boolean;
    scaleMin: number;
    scaleMax: number;
    allowScaleDeflation: boolean;
    labelInset: number;
    lastPaint: number;
    maxPaintMs: number;
    textHeight: number;
    plotPadding: number;
    showMiddle: boolean;
    showScale: boolean;
    drawLoop: () => void;
    constructor(canvasEl: HTMLCanvasElement);
    pushScale(min: number, max: number): number;
    map(value: number, x1: number, y1: number, x2: number, y2: number): number;
    scaleNumber(v: number): string;
    drawScale(g: CanvasRenderingContext2D, min: number, max: number, avg: number, range: number, plotWidth: number, plotHeight: number): void;
    baseDraw(): void;
    draw(g: CanvasRenderingContext2D, plotWidth: number, plotHeight: number): void;
    repaint(): void;
}

declare class Plot extends BasePlot {
    buffer: Circular<number>;
    samples: number;
    color: string;
    lineWidth: number;
    constructor(canvasEl: HTMLCanvasElement, samples?: number);
    draw(g: CanvasRenderingContext2D, plotWidth: number, plotHeight: number): void;
    clear(): void;
    push(v: number): void;
}

declare function paths(ctx: CanvasRenderingContext2D, pathsToDraw: Path[], opts?: {
    debug?: boolean;
}): void;
declare function connectedPoints(ctx: CanvasRenderingContext2D, pts: Point[], opts?: {
    loop?: boolean;
    strokeStyle?: string;
}): void;
declare function pointLabels(ctx: CanvasRenderingContext2D, pts: Point[], opts?: {
    fillStyle?: string;
}): void;
declare function quadraticBezier(ctx: CanvasRenderingContext2D, line: QuadraticBezier, opts: {
    strokeStyle?: string;
    debug?: boolean;
}): void;
declare function line(ctx: CanvasRenderingContext2D, line: Line, opts?: {
    debug?: boolean;
}): void;

declare const Drawing_paths: typeof paths;
declare const Drawing_connectedPoints: typeof connectedPoints;
declare const Drawing_pointLabels: typeof pointLabels;
declare const Drawing_quadraticBezier: typeof quadraticBezier;
declare const Drawing_line: typeof line;
declare namespace Drawing {
  export {
    Drawing_paths as paths,
    Drawing_connectedPoints as connectedPoints,
    Drawing_pointLabels as pointLabels,
    Drawing_quadraticBezier as quadraticBezier,
    Drawing_line as line,
  };
}

declare const rawNumericRange: (interval: number, start?: number, end?: number | undefined, repeating?: boolean) => Generator<number, void, unknown>;
declare const numericRange: (interval: number, start?: number, end?: number | undefined, repeating?: boolean, rounding?: number | undefined) => Generator<number, void, unknown>;

declare const Producers_rawNumericRange: typeof rawNumericRange;
declare const Producers_numericRange: typeof numericRange;
declare namespace Producers {
  export {
    Producers_rawNumericRange as rawNumericRange,
    Producers_numericRange as numericRange,
  };
}

declare type SeriesEventMap<V> = {
    data: V;
    done: boolean;
    cancel: string;
};
declare type SeriesValueNeeded<V> = () => V | undefined;
declare const fromGenerator: <V>(vGen: Generator<V, any, unknown>) => Series<V>;
declare const fromTimedIterable: <V>(vIter: Iterable<V> | AsyncIterable<V>, delayMs?: number, intervalMs?: number) => Series<V>;
declare const fromEvent: (source: EventTarget, eventType: string) => Series<any>;
declare class Series<V> extends SimpleEventEmitter<SeriesEventMap<V>> implements AsyncIterable<V> {
    #private;
    onValueNeeded: SeriesValueNeeded<V> | undefined;
    constructor();
    [Symbol.asyncIterator](): AsyncIterator<any, any, undefined>;
    mergeEvent(source: EventTarget, eventType: string): void;
    _setDone(): void;
    push(v: V): void;
    cancel(cancelReason?: string): void;
    get cancelled(): boolean;
    get done(): boolean;
    get value(): V | undefined;
}

declare const Series$1_fromGenerator: typeof fromGenerator;
declare const Series$1_fromTimedIterable: typeof fromTimedIterable;
declare const Series$1_fromEvent: typeof fromEvent;
type Series$1_Series<V> = Series<V>;
declare const Series$1_Series: typeof Series;
declare namespace Series$1 {
  export {
    Series$1_fromGenerator as fromGenerator,
    Series$1_fromTimedIterable as fromTimedIterable,
    Series$1_fromEvent as fromEvent,
    Series$1_Series as Series,
  };
}

export { Bezier as Beziers, Drawing, Easing$1 as Easings, Envelope$1 as Envelopes, Grid$1 as Grids, Line$1 as Lines, Lists, MultiPath$1 as MultiPaths, Path$1 as Paths, Plot, Point$1 as Points, Producers, Rect$1 as Rects, Series$1 as Series, Sets };
