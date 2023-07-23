import {expect, test} from '@jest/globals';
/* eslint-disable */
import {iterateBreadth, iterateDepth, type Node} from '../../flow/BehaviourTree';
import {jest} from '@jest/globals';

const createDescr = (): Node => {
  return {
    name: `root`,
    seq: [
      `walk_to_door`,
      {
        name: `door_locked`,
        sel: [
          `open_door`,
          {
            name: `open_locked_door`,
            seq: [`unlock_door`, `open_door`]
          },
          `smash_door`]
      },
      `walk_through_door`,
      `close_door`
    ]
  };

}
