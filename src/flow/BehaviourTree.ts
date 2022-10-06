export type TaskState = `Failed`|`Running`|`Success`;
export type Task = {
  readonly state: TaskState
}


// Sequence runs children until the first one fails (serial)
// Selector runs children until the first succeeds

/**
 * Node can have conditions as to whether they should even be considered
 * Conditions can have dependencies on values, ideally this is responsive
 * Conditions might abort sibling nodes, as in example: https://docs.unrealengine.com/4.27/en-US/InteractiveExperiences/ArtificialIntelligence/BehaviorTrees/BehaviorTreesOverview/
 */

export type NodeBase = {
  readonly name?: string
}

export type SeqNode = NodeBase & {
  readonly seq: readonly Node[]
}
export type SelNode = NodeBase & {
  readonly sel: readonly Node[]
}

export type Node = SeqNode | SelNode | string;

const t:Node = {
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

type Traversal = readonly [
  node:Node,
  path:string
];

const getName = (t:Node, defaultValue = ``) => {
  if (typeof t === `object`) {
    if (`name` in t) {
      if (t.name !== undefined) return t.name;
    }
  }
  return defaultValue;
};

//eslint-disable-next-line func-style
export function* iterateBreadth(t:Node, pathPrefix?:string):Generator<Traversal> {
  if (typeof pathPrefix === `undefined`) {
    pathPrefix = getName(t);
  }
 
  for (const [i, n] of entries(t)) {
    yield [n, pathPrefix];    
  }
  for (const [i, n] of entries(t)) {
    const name = getName(n, `?`);
    const prefix = pathPrefix.length > 0 ? pathPrefix +`.` +name : name;
    yield* iterateBreadth(n, prefix);    
  }
}

//eslint-disable-next-line func-style
export function* iterateDepth(t:Node, pathPrefix?:string):Generator<Traversal> {
  if (typeof pathPrefix === `undefined`) {
    pathPrefix = getName(t);
  }
  for (const [i, n] of entries(t)) {
    yield [n, pathPrefix];
    const name = getName(n, `?`);
    const prefix = pathPrefix.length > 0 ? pathPrefix +`.` +name : name;
    yield* iterateBreadth(n, prefix);     
  }
}

type ValidateOpts = {
  readonly duplicatesAllowed:boolean
}

//eslint-disable-next-line func-style
function isSeqNode(n:Node): n is SeqNode {
  return (n as SeqNode).seq !== undefined;
}

//eslint-disable-next-line func-style
function isSelNode(n:Node): n is SelNode {
  return (n as SelNode).sel !== undefined;
}

//eslint-disable-next-line func-style
function* entries(n:Node) {
  if (isSeqNode(n)) {
    yield* n.seq.entries();
  } else if (isSelNode(n)) {
    yield* n.sel.entries();
  } else if (typeof n ===`string`) {
    // no-op
  } else {
    throw new Error(`Unexpected shape of node. seq/sel missing`);
  }
}

for (const tn of iterateBreadth(t)) {
  console.log(`Path: ${tn[1]}`);
  console.log(`Node: ${JSON.stringify(tn[0])}`);
}

console.log(`---`);

for (const tn of iterateDepth(t)) {
  console.log(`Path: ${tn[1]}`);
  console.log(`Node: ${JSON.stringify(tn[0])}`);
}
