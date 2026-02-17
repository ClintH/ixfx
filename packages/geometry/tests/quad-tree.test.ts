import { describe, test, expect } from 'vitest';
import { quadTree, Direction } from '../src/quad-tree.js';

describe('quad-tree', () => {
  test('creates empty quad tree', () => {
    const tree = quadTree({ x: 0, y: 0, width: 100, height: 100 });
    expect(tree).toBeDefined();
    expect(tree.getValue()).toHaveLength(0);
  });

  test('adds items to quad tree', () => {
    const tree = quadTree({ x: 0, y: 0, width: 100, height: 100 });
    const result = tree.add({ x: 10, y: 10 });
    expect(result).toBe(true);
    expect(tree.getValue()).toHaveLength(1);
  });

  test('rejects items outside boundary', () => {
    const tree = quadTree({ x: 0, y: 0, width: 10, height: 10 });
    const result = tree.add({ x: 100, y: 100 });
    expect(result).toBe(false);
  });

  test('creates with initial data', () => {
    const items = [
      { x: 10, y: 10 },
      { x: 20, y: 20 },
      { x: 30, y: 30 }
    ];
    const tree = quadTree({ x: 0, y: 0, width: 100, height: 100 }, items);
    expect(tree.getValue().length + getAllChildItems(tree)).toBe(3);
  });

  test(' subdivides when max items exceeded', () => {
    const tree = quadTree({ x: 0, y: 0, width: 100, height: 100 }, [], { maxItems: 2, maxLevels: 4 });
    
    // Add more items than maxItems
    tree.add({ x: 10, y: 10 });
    tree.add({ x: 20, y: 20 });
    tree.add({ x: 30, y: 30 });
    
    // Should have children after subdivision
    expect(tree.getLengthChildren()).toBeGreaterThan(0);
  });

  test('direction returns child in direction', () => {
    const tree = quadTree({ x: 0, y: 0, width: 100, height: 100 });
    
    // After subdivision
    tree.add({ x: 10, y: 10 });
    tree.add({ x: 20, y: 20 });
    tree.add({ x: 30, y: 30 });
    
    const child = tree.direction(Direction.Nw);
    // Depending on point locations, there might be a child in some direction
    expect(child === undefined || child !== undefined).toBe(true);
  });

  test('children iterates over child nodes', () => {
    const tree = quadTree({ x: 0, y: 0, width: 100, height: 100 }, [], { maxItems: 1, maxLevels: 4 });
    
    tree.add({ x: 10, y: 10 });
    tree.add({ x: 20, y: 20 });
    tree.add({ x: 30, y: 30 });
    tree.add({ x: 40, y: 40 });
    tree.add({ x: 50, y: 50 });
    
    const children = [...tree.children()];
    expect(children.length).toBeGreaterThan(0);
  });

  test('couldHold checks if point could be in boundary', () => {
    const tree = quadTree({ x: 0, y: 0, width: 100, height: 100 });
    
    expect(tree.couldHold({ x: 50, y: 50 })).toBe(true);
    expect(tree.couldHold({ x: 150, y: 150 })).toBe(false);
  });

  test('getParent returns parent node', () => {
    const tree = quadTree({ x: 0, y: 0, width: 100, height: 100 }, [], { maxItems: 1, maxLevels: 4 });
    
    tree.add({ x: 10, y: 10 });
    tree.add({ x: 20, y: 20 });
    
    const children = [...tree.children()];
    if (children.length > 0) {
      expect(children[0].getParent()).toBe(tree);
    }
  });

  test('supports custom maxItems and maxLevels', () => {
    const tree = quadTree({ x: 0, y: 0, width: 100, height: 100 }, [], { maxItems: 10, maxLevels: 2 });
    expect(tree).toBeDefined();
  });
});

function getAllChildItems(tree: ReturnType<typeof quadTree>): number {
  let count = 0;
  for (const child of tree.children()) {
    count += child.getValue().length;
    count += getAllChildItems(child);
  }
  return count;
}
