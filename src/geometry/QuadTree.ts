import { Points, Rects, Shapes } from ".";
import { TreeNode } from "../collections/Trees.js";
import { ShapePositioned } from "./Shape";

enum Direction {
  Nw, Ne, Sw, Se
}

type QuadTreeItem = Points.Point | ShapePositioned;

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

export class QuadTreeNode extends TreeNode<void> {
  items:QuadTreeItem[] = [];
  constructor(readonly boundary:Rects.RectPositioned, readonly level:number, readonly opts:QuadTreeOpts) {
    super(undefined);
  }

  direction(d:Direction):QuadTreeNode|undefined {
    return this.descendants[d] as QuadTreeNode|undefined;
  }
  
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

export type QuadTreeOpts = {
  readonly maxItems:number
  readonly maxLevels:number
}
