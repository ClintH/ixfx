import { type TraversableTree } from '@ixfx/collections';
import * as Shapes from './shape/index.js';
import type { Point } from './point/point-type.js';
import { fromTopLeft as RectsFromTopLeft } from './rect/from-top-left.js';
import { intersectsPoint as RectsIntersectsPoint } from './rect/Intersects.js';
import { fromNumbers as PointsFromNumbers } from './point/from.js';
import type { ShapePositioned } from './shape/index.js';
import type { RectPositioned } from './rect/rect-types.js';
/**
 * Options for quad tree
 */
export type QuadTreeOpts = {
  /**
   * Maximum items per node
   */
  readonly maxItems: number;
  /**
   * Maximum level of sub-division
   */
  readonly maxLevels: number;
};

/**
 * Direction
 */
export enum Direction {
  Nw,
  Ne,
  Sw,
  Se,
}

/**
 * A Point or ShapePositioned
 */
export type QuadTreeItem = Point | ShapePositioned;

/**
 * Creates a QuadTreeNode
 * @param bounds Bounds of region
 * @param initialData Initial items to place in quad tree
 * @param opts Options
 * @returns New quad tree
 */
export const quadTree = (bounds: RectPositioned, initialData: readonly QuadTreeItem[] = [], opts: Partial<QuadTreeOpts> = {}): QuadTreeNode => {
  const o: QuadTreeOpts = {
    maxItems: opts.maxItems ?? 4,
    maxLevels: opts.maxLevels ?? 4
  };

  const n = new QuadTreeNode(undefined, bounds, 0, o);
  for (const d of initialData) {
    n.add(d);
  }
  return n;
};

/**
 * QuadTreeNode. The values of the node is an array of {@link QuadTreeItem}.
 *
 * To create, you probably want the {@link quadTree} function.
 * 
 */
export class QuadTreeNode implements TraversableTree<QuadTreeItem[]> {
  #items: QuadTreeItem[] = [];
  #children: QuadTreeNode[] = [];
  #parent: QuadTreeNode | undefined;
  /**
   * Constructor
   * @param boundary
   * @param level
   * @param opts
   */
  constructor(
    parent: QuadTreeNode | undefined,
    readonly boundary: RectPositioned,
    readonly level: number,
    readonly opts: QuadTreeOpts
  ) {
    this.#parent = parent;
  }

  getLengthChildren(): number {
    return this.#children.length;
  }

  *parents(): IterableIterator<QuadTreeNode> {
    //eslint-disable-next-line functional/no-let,@typescript-eslint/no-this-alias
    let n: QuadTreeNode | undefined = this;
    while (n.#parent !== undefined) {
      yield n.#parent;
      n = n.#parent;
    }
  }

  getParent(): QuadTreeNode | undefined {
    return this.#parent;
  }

  /**
   * Iterates over immediate children
   */
  *children(): IterableIterator<QuadTreeNode> {
    for (const c of this.#children) {
      yield c;
    }
  }

  /**
   * Array of QuadTreeItem
   * @returns
   */
  getValue(): QuadTreeItem[] {
    return this.#items;
  }

  getIdentity(): this {
    return this;
  }
  /**
   * Get a descendant node in a given direction
   * @param d
   * @returns
   */
  direction(d: Direction): QuadTreeNode | undefined {
    return this.#children[ d ] as QuadTreeNode | undefined;
  }

  /**
   * Add an item to the quadtree
   * @param p
   * @returns False if item is outside of boundary, True if item was added
   */
  add(p: QuadTreeItem): boolean {
    if (!Shapes.isIntersecting(this.boundary, p)) return false;

    if (this.#children.length > 0) {
      for (const d of this.#children) (d).add(p);
      return true;
    }

    this.#items.push(p);

    if (
      this.#items.length > this.opts.maxItems &&
      this.level < this.opts.maxLevels
    ) {
      if (this.#children.length === 0) {
        this.#subdivide();
      }

      // Add to child
      for (const item of this.#items) {
        for (const d of this.#children) (d).add(item);
      }
      //this.descendants.forEach(d => (d as QuadTreeNode).add(p));
      this.#items = [];
    }
    return true;
  }

  /**
   * Returns true if point is inside node's boundary
   * @param p
   * @returns
   */
  couldHold(p: Point): boolean {
    return RectsIntersectsPoint(this.boundary, p);
  }

  #subdivide() {
    const w = this.boundary.width / 2;
    const h = this.boundary.height / 2;
    const x = this.boundary.x;
    const y = this.boundary.y;

    // top-left corners of each of the four new sections
    const coords = PointsFromNumbers(x + w, y, x, y, x, y + h, x + w, y + h);
    const rects = coords.map((p) => RectsFromTopLeft(p, w, h));
    // rects.forEach((r, index) => {
    //   this.descendants[index] = new QuadTreeNode(r, this.level + 1, this.opts);
    // });
    this.#children = rects.map(
      (r) => new QuadTreeNode(this, r, this.level + 1, this.opts)
    );
  }
}
