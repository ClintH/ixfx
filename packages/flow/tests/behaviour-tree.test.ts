import { describe, test, expect } from 'vitest';
import { 
  iterateBreadth, 
  iterateDepth,
  type BtNode,
  type SeqNode,
  type SelNode
} from '../src/behaviour-tree.js';

describe('flow/behaviour-tree', () => {

  describe('iterateBreadth()', () => {
    test('iterates single string node', () => {
      const root: BtNode = 'leaf';
      const result = Array.from(iterateBreadth(root));
      
      expect(result).toHaveLength(0); // String nodes have no children
    });

    test('iterates sequence node with string children', () => {
      const root: BtNode = {
        seq: ['child1', 'child2', 'child3']
      };
      const result = Array.from(iterateBreadth(root));
      
      expect(result).toHaveLength(3);
      expect(result[0][0]).toBe('child1');
      expect(result[1][0]).toBe('child2');
      expect(result[2][0]).toBe('child3');
    });

    test('iterates selector node with string children', () => {
      const root: BtNode = {
        sel: ['option1', 'option2', 'option3']
      };
      const result = Array.from(iterateBreadth(root));
      
      expect(result).toHaveLength(3);
      expect(result[0][0]).toBe('option1');
      expect(result[1][0]).toBe('option2');
      expect(result[2][0]).toBe('option3');
    });

    test('generates paths correctly', () => {
      const root: BtNode = {
        name: 'root',
        seq: ['child1', 'child2']
      };
      const result = Array.from(iterateBreadth(root));
      
      expect(result[0][1]).toBe('root');
      expect(result[1][1]).toBe('root');
    });

    test('handles nested sequence nodes', () => {
      const root: BtNode = {
        name: 'root',
        seq: [
          'action1',
          {
            name: 'nested',
            seq: ['nested1', 'nested2']
          }
        ]
      };
      const result = Array.from(iterateBreadth(root));
      
      // First level
      expect(result[0][0]).toBe('action1');
      expect(result[0][1]).toBe('root');
      
      // Second level (nested seq node itself)
      expect(result[1][0]).toEqual({ name: 'nested', seq: ['nested1', 'nested2'] });
      expect(result[1][1]).toBe('root');
      
      // Third level (children of nested node)
      expect(result[2][0]).toBe('nested1');
      expect(result[2][1]).toBe('root.nested');
      expect(result[3][0]).toBe('nested2');
      expect(result[3][1]).toBe('root.nested');
    });

    test('handles complex tree with both seq and sel nodes', () => {
      const root: BtNode = {
        name: 'root',
        seq: [
          'walk_to_door',
          {
            name: 'door_locked',
            sel: [
              'open_door',
              {
                name: 'open_locked_door',
                seq: ['unlock_door', 'open_door']
              }
            ]
          },
          'walk_through_door'
        ]
      };
      
      const result = Array.from(iterateBreadth(root));
      
      // Check first level
      expect(result[0][0]).toBe('walk_to_door');
      expect(result[1][0]).toEqual(expect.objectContaining({ name: 'door_locked' }));
      expect(result[2][0]).toBe('walk_through_door');
      
      // Check second level (children of door_locked)
      expect(result[3][0]).toBe('open_door');
      expect(result[3][1]).toBe('root.door_locked');
      expect(result[4][0]).toEqual(expect.objectContaining({ name: 'open_locked_door' }));
      expect(result[4][1]).toBe('root.door_locked');
      
      // Check third level (children of open_locked_door)
      expect(result[5][0]).toBe('unlock_door');
      expect(result[5][1]).toBe('root.door_locked.open_locked_door');
    });

    test('uses default name for nodes without name', () => {
      const root: BtNode = {
        seq: [
          { sel: ['child1'] }
        ]
      };
      const result = Array.from(iterateBreadth(root, 'root'));
      
      // The nested node without name should use '?' as default
      expect(result[1][1]).toBe('root.?');
    });

    test('handles empty children arrays', () => {
      const root: BtNode = {
        seq: []
      };
      const result = Array.from(iterateBreadth(root));
      
      expect(result).toHaveLength(0);
    });

    test('throws on invalid node type', () => {
      // @ts-expect-error Testing invalid node
      const invalidNode: BtNode = { invalid: true };
      
      expect(() => {
        Array.from(iterateBreadth(invalidNode));
      }).toThrow('Unexpected shape of node');
    });
  });

  describe('iterateDepth()', () => {
    test('iterates single string node', () => {
      const root: BtNode = 'leaf';
      const result = Array.from(iterateDepth(root));
      
      expect(result).toHaveLength(0);
    });

    test('iterates sequence node with string children', () => {
      const root: BtNode = {
        name: 'root',
        seq: ['child1', 'child2']
      };
      const result = Array.from(iterateDepth(root));
      
      expect(result).toHaveLength(2);
      expect(result[0][0]).toBe('child1');
      expect(result[1][0]).toBe('child2');
    });

    test('depth-first traversal order', () => {
      const root: BtNode = {
        name: 'root',
        seq: [
          'action1',
          {
            name: 'branch',
            seq: ['nested1', 'nested2']
          },
          'action2'
        ]
      };
      const result = Array.from(iterateDepth(root));
      
      // Depth-first should visit nested nodes before continuing to siblings
      expect(result[0][0]).toBe('action1');
      expect(result[1][0]).toEqual(expect.objectContaining({ name: 'branch' }));
      expect(result[2][0]).toBe('nested1');
      expect(result[3][0]).toBe('nested2');
      expect(result[4][0]).toBe('action2');
    });

    test('generates correct paths in depth-first order', () => {
      const root: BtNode = {
        name: 'root',
        seq: [
          {
            name: 'branch1',
            seq: ['leaf1']
          },
          {
            name: 'branch2',
            seq: ['leaf2']
          }
        ]
      };
      const result = Array.from(iterateDepth(root));
      
      expect(result[0][1]).toBe('root');
      expect(result[1][1]).toBe('root.branch1');
      expect(result[2][1]).toBe('root.branch1');
      expect(result[3][1]).toBe('root');
      expect(result[4][1]).toBe('root.branch2');
      expect(result[5][1]).toBe('root.branch2');
    });

    test('handles mixed seq and sel nodes', () => {
      const root: BtNode = {
        name: 'root',
        seq: [
          'step1',
          {
            name: 'decision',
            sel: ['option1', 'option2']
          }
        ]
      };
      const result = Array.from(iterateDepth(root));
      
      expect(result).toHaveLength(4);
      expect(result[0][0]).toBe('step1');
      expect(result[1][0]).toEqual(expect.objectContaining({ name: 'decision' }));
      expect(result[2][0]).toBe('option1');
      expect(result[3][0]).toBe('option2');
    });

    test('handles deeply nested structure', () => {
      const root: BtNode = {
        name: 'level1',
        seq: [{
          name: 'level2',
          seq: [{
            name: 'level3',
            seq: ['leaf']
          }]
        }]
      };
      const result = Array.from(iterateDepth(root));
      
      expect(result).toHaveLength(3);
      expect(result[0][1]).toBe('level1');
      expect(result[1][1]).toBe('level1.level2');
      expect(result[2][1]).toBe('level1.level2.level3');
    });
  });
});
