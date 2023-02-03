import { Points, Rects, Shapes } from ".";
import { TreeNode } from "../collections/Trees.js";
import { ShapePositioned } from "./Shape";

/**
 * Options for quad tree
 */
export type QuadTreeOpts = {
  /**
   * Maximum items per node
   */
  readonly maxItems:number
  /**
   * Maximum level of sub-division
   */
  readonly maxLevels:number
}


/**
 * Direction
 */
export enum Direction {
  Nw, Ne, Sw, Se
}

/**
 * A Point or ShapePositioned
 */
export type QuadTreeItem = Points.Point | ShapePositioned;

/**
 * Creates a QuadTreeNode
 * @param bounds Bounds of region
 * @param initialData Initial items to place in quad tree
 * @param opts Options
 * @returns New quad tree
 */
export const quadTree = (bounds:Rects.RectPositioned, initialData:readonly QuadTreeItem[] = [], opts:Partial<QuadTreeOpts> = {}):QuadTreeNode => {
  const o:QuadTreeOpts = {
    maxItems: opts.maxItems ?? 4,
    maxLevels: opts.maxLevels ?? 4
  };

  const n = new QuadTreeNode(bounds, 0, o);
  initialData.forEach(d => {
    n.add(d);
  });
  return n;
};

/**
 * QuadTreeNode
 * 
 * To create, you probably want the {@link quadTree} function.
 */
export class QuadTreeNode extends TreeNode<void> {
  items:QuadTreeItem[] = [];
  
  /**
   * Constructor
   * @param boundary 
   * @param level 
   * @param opts 
   */
  constructor(readonly boundary:Rects.RectPositioned, readonly level:number, readonly opts:QuadTreeOpts) {
    super(undefined);
  }

  /**
   * Get a descendant node in a given direction
   * @param d 
   * @returns 
   */
  direction(d:Direction):QuadTreeNode|undefined {
    return this.descendants[d] as QuadTreeNode|undefined;
  }
  
  /**
   * Add an item to the quadtree
   * @param p 
   * @returns False if item is outside of boundary, True if item was added
   */
  add(p:QuadTreeItem):boolean {
    if (!Shapes.isIntersecting(this.boundary, p)) return false;

    if (this.descendants.length) {
      this.descendants.forEach(d => (d as QuadTreeNode).add(p));
      return true;
    }

    this.items.push(p);
    
    if (this.items.length > this.opts.maxItems && this.level < this.opts.maxLevels) {
      if (!this.descendants.length) { 
        this.#subdivide();
      }
      
      // Add to child
      this.items.forEach(item => {
        this.descendants.forEach(d => (d as QuadTreeNode).add(item));
      });
      //this.descendants.forEach(d => (d as QuadTreeNode).add(p));
      this.items = [];
    }
    return true;
  }

  /**
   * Returns true if point is inside node's boundary
   * @param p 
   * @returns 
   */
  couldHold(p:Points.Point) {
    return Rects.intersectsPoint(this.boundary, p);
  }

  #subdivide() {
    const w = this.boundary.width / 2;
    const h = this.boundary.height / 2;
    const x = this.boundary.x;
    const y = this.boundary.y;
    
    // top-left corners of each of the four new sections
    const coords = Points.fromNumbers(
      x+w, y, x, y, x, y+h, x+w, y+h
    );
    const rects = coords.map(p => Rects.fromTopLeft(p, w, h));
    rects.forEach((r, index) => {
      this.descendants[index] = new QuadTreeNode(r, this.level + 1, this.opts);
    });
  }
}

