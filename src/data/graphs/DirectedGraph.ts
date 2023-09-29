/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { QueueMutable, StackMutable } from "../../collections/index.js"
import { PriorityMutable } from "../../collections/queue/PriorityMutable.js"
import { immutable as immutableMap, type IMapImmutable } from "../../collections/map/Map.js"
import { NumberMap } from "../../collections/map/NumberMap.js"
import { Sync } from "../../Generators.js"
import { Table } from "../Table.js"

export type DistanceCompute = (graph: DirectedGraph, edge: Edge) => number;

/**
 * Vertex. These are the _nodes_ of the graph. Immutable.
 * 
 * They keep track of all of their outgoing edges, and
 * a unique id.
 * 
 * Ids are used for accessing/updating vertices as well as in the
 * {@link Edge} type. They must be unique.
 */
export type Vertex = Readonly<{
  out: ReadonlyArray<Edge>
  id: string
}>

/**
 * Edge. Immutable.
 * 
 * Only encodes the destination vertex. The from
 * is known since edges are stored on the from vertex.
 */
export type Edge = Readonly<{
  /**
   * Vertex id edge connects to (ie. destination)
   */
  id: string,
  /**
   * Optional weight of edge
   */
  weight?: number
}>

/**
 * Create a vertex with given id
 * @param id 
 * @returns 
 */
export const createVertex = (id: string): Vertex => {
  return {
    id,
    out: []
  }
}

/**
 * Options for connecting vertices
 */
export type ConnectOptions = Readonly<{
  /**
   * From, or source of connection
   */
  from: string
  /**
   * To, or destination of connection. Can be multiple vertices for quick use
   */
  to: string | Array<string>
  /**
   * If true, edges in opposite direction are made as well
   */
  bidi?: boolean
  /**
   * Weight for this connection (optional)
   */
  weight?: number
}>

/**
 * Directed graph. Immutable
 * 
 * Consists of {@link Vertex|vertices}, which all have zero or more outgoing {@link Edge|Edges}.
 */
export type DirectedGraph = Readonly<{
  vertices: IMapImmutable<string, Vertex>
}>

// export function fromAdjacenyMatrix(m: Array<Array<boolean>>): DirectedGraph {
//   let g = graph();
//   for (const row of m) {
//     connect(g, { from, to })
//   }
//   return g;
// }

/**
 * Returns the graph connections as an adjacency matrix
 * @param graph 
 * @returns 
 */
export function toAdjacencyMatrix(graph: DirectedGraph): Table<boolean> {
  const v = [ ...graph.vertices.values() ];
  //const m: Array<Array<boolean>> = [];
  const table = new Table<boolean>();
  table.labelColumns(...v.map(vv => vv.id));
  table.labelRows(...v.map(vv => vv.id));

  // const row: Array<boolean> = [];
  // for (let index = 0; index < v.length; index++) {
  //   row[ index ] = false;
  // }

  // eslint-disable-next-line @typescript-eslint/prefer-for-of, unicorn/prevent-abbreviations
  for (let i = 0; i < v.length; i++) {
    //m[ i ] = [ ...row ];
    table.setRow(i, v.length, false);
    const ii = v[ i ];
    // eslint-disable-next-line unicorn/prevent-abbreviations
    for (const [ j, jj ] of v.entries()) {
      if (ii.out.some(o => o.id === jj.id)) {
        //m[ i ][ j ] = true;
        table.set(i, j, true);
      }
    }
  }
  return table;
}

/**
 * Return a string representation of the graph for debug inspection
 * @param graph 
 * @returns 
 */
export const dumpGraph = (graph: DirectedGraph | Iterable<Vertex>): string => {
  const lines = debugGraphToArray(graph);
  return lines.join(`\n`);
}

/**
 * Return an array of a debug-print of every vertex.
 * @param graph 
 * @returns 
 */
const debugGraphToArray = (graph: DirectedGraph | Iterable<Vertex>): Array<string> => {
  const r: Array<string> = [];
  const vertices = (`vertices` in graph) ? graph.vertices.values() : graph;

  for (const v of vertices) {
    // eslint-disable-next-line unicorn/prevent-abbreviations
    const str = debugDumpVertex(v);
    r.push(...str.map(line => ` ${ line }`));
  }
  return r;
}


export const distance = (graph: DirectedGraph, edge: Edge): number => {
  if (edge.weight !== undefined) return edge.weight;
  return 1;
}

/**
 * Iterate over all the edges in the graph
 * @param graph 
 */
export function* edges(graph: DirectedGraph) {
  const vertices = [ ...graph.vertices.values() ];
  for (const vertex of vertices) {
    for (const edge of vertex.out) {
      yield edge;
    }
  }
}

/**
 * Iterate over all the vertices of the graph
 * @param graph 
 */
export function* vertices(graph: DirectedGraph) {
  const vertices = [ ...graph.vertices.values() ];
  for (const vertex of vertices) {
    yield vertex;
  }
}

/**
 * Iterate over all the vertices connectd to `context` vertex
 * @param graph Graph
 * @param context id or Vertex
 * @returns 
 */
export function* adjacentVertices(graph: DirectedGraph, context: Vertex | string | undefined) {
  if (context === undefined) return;
  const vertex = typeof context === `string` ? graph.vertices.get(context) : context;
  if (vertex === undefined) throw new Error(`Vertex not found ${ JSON.stringify(context) }`);

  for (const edge of vertex.out) {
    const edgeV = graph.vertices.get(edge.id);
    if (edgeV === undefined) throw new Error(`Could not find vertex: ${ edge.id }`);
    yield edgeV;
  }
}

/**
 * Returns _true_ if `vertex` has an outgoing connection to
 * the supplied id or vertex.
 * 
 * If `vertex` is undefined, _false_ is returned.
 * @param vertex From vertex
 * @param outIdOrVertex To vertex
 * @returns 
 */
export const vertexHasOut = (vertex: Vertex, outIdOrVertex: string | Vertex): boolean => {
  if (vertex === undefined) return false;
  const outId = typeof outIdOrVertex === `string` ? outIdOrVertex : outIdOrVertex.id;
  return vertex.out.some(edge => edge.id === outId);
}

/**
 * Returns _true_ if `vertex` has no outgoing connections
 * @param graph 
 * @param vertex 
 * @returns 
 */
export const hasNoOuts = (graph: DirectedGraph, vertex: string | Vertex): boolean => {
  const context = typeof vertex === `string` ? graph.vertices.get(vertex) : vertex;
  if (context === undefined) return false;
  return context.out.length === 0;
}

/**
 * Returns _true_ if `vertex` only has the given list of vertices.
 * Returns _false_ early if the length of the list does not match up with `vertex.out`
 * @param graph 
 * @param vertex 
 * @param outIdOrVertex 
 * @returns 
 */
export const hasOnlyOuts = (graph: DirectedGraph, vertex: string | Vertex, ...outIdOrVertex: Array<string | Vertex>): boolean => {
  const context = resolveVertex(graph, vertex);
  const outs = outIdOrVertex.map(o => resolveVertex(graph, o));

  if (outs.length !== context.out.length) {
    //console.log(`length mismatch. context: ${ JSON.stringify(context.out) } out ${ JSON.stringify(outIdOrVertex) }`);
    return false;
  }
  for (const out of outs) {
    //console.log(`Testing ${ context.id } -> ${ out.id }`);
    if (!hasOut(graph, context, out)) {
      //console.log(`  no`);
      return false;
    }
  }
  return true;
}

/**
 * Returns _true_ if `vertex` has an outgoing connection to the given vertex.
 * @param graph 
 * @param vertex 
 * @param outIdOrVertex 
 * @returns 
 */
export const hasOut = (graph: DirectedGraph, vertex: string | Vertex, outIdOrVertex: string | Vertex): boolean => {
  const context = resolveVertex(graph, vertex);
  const outId = typeof outIdOrVertex === `string` ? outIdOrVertex : outIdOrVertex.id;
  return context.out.some(edge => edge.id === outId);
}

// export const hasIn = (graph: Graph, contextIdOrVertex: string | Vertex, id: string): boolean => {
//   const context = typeof contextIdOrVertex === `string` ? graph.vertices.get(contextIdOrVertex) : contextIdOrVertex;

//   if (context === undefined) return false;
//   if (context.in === undefined) return false;
//   return context.in.some(edge => edge.id === id);
// }

/**
 * Gets a vertex by id, creating it if it does not exist.
 * @param graph 
 * @param id 
 * @returns 
 */
export const getOrCreate = (graph: DirectedGraph, id: string): Readonly<{ graph: DirectedGraph, vertex: Vertex }> => {
  const v = graph.vertices.get(id);
  if (v !== undefined) return { graph, vertex: v };

  const vv = createVertex(id);
  const gg = updateGraphVertex(graph, vv);
  return { graph: gg, vertex: vv };
}

/**
 * Gets a vertex by id, throwing an error if it does not exist
 * @param graph 
 * @param id 
 * @returns 
 */
export const getOrFail = (graph: DirectedGraph, id: string): Vertex => {
  const v = graph.vertices.get(id);
  if (v === undefined) throw new Error(`Vertex '${ id }' not found in graph`);
  return v;
}

/**
 * Updates a vertex by returning a mutated graph
 * @param graph Graph
 * @param vertex Newly changed vertex
 * @returns 
 */
export const updateGraphVertex = (graph: DirectedGraph, vertex: Vertex): DirectedGraph => {
  const gr = {
    ...graph,
    vertices: graph.vertices.set(vertex.id, vertex)
  }
  return gr;
}

/**
 * Default distance computer. Uses `weight` property of edge, or `1` if not found.
 * @param graph 
 * @param edge 
 * @returns 
 */
export const distanceDefault = (graph: DirectedGraph, edge: Edge): number => {
  if (edge.weight !== undefined) return edge.weight;
  return 1;
}

/**
 * Returns a mutation of `graph`, with a given edge removed.
 * 
 * If edge was not there, original graph is returned.
 * @param graph 
 * @param from 
 * @param to 
 * @returns 
 */
export function disconnect(graph: DirectedGraph, from: string | Vertex, to: string | Vertex): DirectedGraph {
  const fromV = resolveVertex(graph, from);
  const toV = resolveVertex(graph, to);

  return hasOut(graph, fromV, toV) ? updateGraphVertex(graph, {
    ...fromV,
    out: fromV.out.filter(t => t.id !== toV.id)
  }) : graph;
}

/**
 * Make a connection between two vertices with a given weight.
 * It returns the new graph as wll as the created edge.
 * @param graph 
 * @param from 
 * @param to 
 * @param weight 
 * @returns 
 */
export function connectTo(graph: DirectedGraph, from: string, to: string, weight?: number): { graph: DirectedGraph, edge: Edge } {
  const fromResult = getOrCreate(graph, from);
  graph = fromResult.graph;
  const toResult = getOrCreate(graph, to);
  graph = toResult.graph;

  const edge: Edge = {
    id: to,
    weight
  }

  if (!hasOut(graph, fromResult.vertex, toResult.vertex)) {
    graph = updateGraphVertex(graph, {
      ...fromResult.vertex,
      // Add new edge to list of edges for this node
      out: [ ...fromResult.vertex.out, edge ]
    });
  }
  return { graph, edge }
}

/**
 * Connect from -> to. By default unidirectional.
 * Returns a new graph with the connection
 * @param graph 
 * @param options 
 * @returns 
 */
export function connect(graph: DirectedGraph, options: ConnectOptions): DirectedGraph {
  const { to, weight, from } = options;
  const bidi = options.bidi ?? false;
  const toList = Array.isArray(to) ? to : [ to ];

  // Connect from -> to
  for (const toSingle of toList) {
    const result = connectTo(graph, from, toSingle, weight);
    graph = result.graph;
  }

  if (!bidi) return graph;

  // Bidirectional connection
  // Connect to -> from
  for (const toSingle of toList) {
    const result = connectTo(graph, toSingle, from, weight);
    graph = result.graph;
  }
  return graph;
}

/**
 * Returns an array of debug-representations for the given vertex.
 * @param v 
 * @returns 
 */
const debugDumpVertex = (v: Vertex): Array<string> => {
  const r = [
    `${ v.id }`
  ]
  const stringForEdge = (edge: Edge) => edge.weight === undefined ? edge.id : `${ edge.id } (${ edge.weight })`

  // for (const edge of v.in) {
  //   r.push(` <- ${ stringForEdge(edge) }`);
  // }
  for (const edge of v.out) {
    r.push(` -> ${ stringForEdge(edge) }`);
  }
  if (v.out.length === 0) r[ 0 ] += ` (terminal)`;

  return r;
}

/**
 * Returns _true_ if a->b or b->a
 * @param graph 
 * @param a 
 * @param b 
 * @returns 
 */
export function areAdjacent(graph: DirectedGraph, a: Vertex, b: Vertex) {
  if (hasOut(graph, a, b.id)) return true;
  if (hasOut(graph, b, a.id)) return true;
}

/**
 * Resolves the id or vertex into a Vertex.
 * throws an error if vertex is not found
 * @param graph 
 * @param idOrVertex 
 * @returns 
 */
function resolveVertex(graph: DirectedGraph, idOrVertex: string | Vertex): Vertex {
  const v = typeof idOrVertex === `string` ? graph.vertices.get(idOrVertex) : idOrVertex;
  if (v === undefined) throw new Error(`Id not found ${ idOrVertex as string }`);
  return v;
}

/**
 * Iterates over vertices from a starting vertex in an bread-first-search
 * @param graph 
 * @param startIdOrVertex 
 * @param targetIdOrVertex 
 * @returns 
 */
export function* bfs(graph: DirectedGraph, startIdOrVertex: string | Vertex, targetIdOrVertex?: string | Vertex) {
  const start = resolveVertex(graph, startIdOrVertex);
  const target = targetIdOrVertex === undefined ? undefined : resolveVertex(graph, targetIdOrVertex);

  const queue = new QueueMutable<Vertex>();
  const seen = new Set<string>();
  queue.enqueue(start);
  while (!queue.isEmpty) {
    const v = queue.dequeue()!;
    yield v;
    if (target !== undefined && target === v) return;
    for (const edge of adjacentVertices(graph, v)) {
      if (!seen.has(edge.id)) {
        seen.add(edge.id);
        queue.enqueue(resolveVertex(graph, edge.id));
      }
    }
  }
}

/**
 * Iterates over vertices from a starting vertex in an depth-first-search
 * @param graph 
 * @param startIdOrVertex 
 */
export function* dfs(graph: DirectedGraph, startIdOrVertex: string | Vertex) {
  const source = resolveVertex(graph, startIdOrVertex);

  const s = new StackMutable<Vertex>();
  const seen = new Set<string>();
  s.push(source);
  while (!s.isEmpty) {
    const v = s.pop();
    if (v === undefined) continue;
    if (!seen.has(v.id)) {
      seen.add(v.id);
      yield v;
      for (const edge of v.out) {
        const destination = graph.vertices.get(edge.id);
        if (destination) {
          s.push(destination);
        }
      }
    }
  }
}

/**
 * Compute shortest distance from the source vertex to the rest of the graph.
 * @param graph 
 * @param sourceOrId 
 * @returns 
 */
export const pathDijkstra = (graph: DirectedGraph, sourceOrId: Vertex | string) => {
  const source = typeof sourceOrId === `string` ? graph.vertices.get(sourceOrId) : sourceOrId;
  if (source === undefined) throw new Error(`source vertex not found`);

  const distances = new Map<string, number>();
  const previous = new Map<string, Vertex | null>();

  distances.set(source.id, 0);

  const pq = new PriorityMutable<string>();

  const vertices = [ ...graph.vertices.values() ];
  for (const v of vertices) {
    if (v.id !== source.id) {
      distances.set(v.id, Number.MAX_SAFE_INTEGER);
      // eslint-disable-next-line unicorn/no-null
      previous.set(v.id, null);
    }
    pq.enqueueWithPriority(v.id, Number.MAX_SAFE_INTEGER);
  }

  while (!pq.isEmpty) {
    const u = pq.dequeueMin();
    if (u === undefined) throw new Error(`Bug. Queue unexpectedly empty`);
    const vertexU = graph.vertices.get(u)!;
    for (const neighbour of vertexU.out) {
      //const vertexNeigbour = graph.vertices.get(neighbour.to)!;
      const alt = distances.get(u)! + distance(graph, neighbour);
      if (alt < distances.get(neighbour.id)!) {
        distances.set(neighbour.id, alt);
        previous.set(neighbour.id, vertexU);
        pq.changePriority(neighbour.id, alt, true);
      }
    }
  }

  const pathTo = (id: string): Array<Edge> => {
    const path: Array<Edge> = [];
    while (true) {
      if (id === source.id) break;
      const v = previous.get(id);
      if (v === undefined || v === null) throw new Error(`Id not present: ${ id }`);
      path.push({ id, weight: distances.get(id) });
      id = v.id;
    }
    return path;
  }
  return {
    distances, previous, pathTo
  }
}

/**
 * Clones the graph. Uses shallow clone, because it's all immutable
 * @param graph 
 * @returns 
 */
export const clone = (graph: DirectedGraph): DirectedGraph => {
  const g: DirectedGraph = {
    vertices: immutableMap<string, Vertex>([ ...graph.vertices.entries() ])
  }
  return g;
}

/**
 * Create a graph
 * @param initialConnections 
 * @returns 
 */
export const graph = (...initialConnections: Array<ConnectOptions>): DirectedGraph => {
  let g: DirectedGraph = {
    vertices: immutableMap()
  }
  for (const ic of initialConnections) {
    g = connect(g, ic);
  }
  return g;
}

/**
 * Internal type for Tarjan algorithm
 */
type TarjanVertex = Vertex & {
  lowlink: number
  index: number
  onStack: boolean
}

/**
 * Returns _true_ if the graph contains is acyclic - that is, it has no loops
 * @param graph 
 */
export function isAcyclic(graph: DirectedGraph): boolean {
  const cycles = getCycles(graph);
  return cycles.length === 0;
}

/**
 * Topological sort using Kahn's algorithm.
 * Returns a new graph that is sorted
 * @param graph 
 */
export function topologicalSort(graph: DirectedGraph): DirectedGraph {
  const indegrees = new NumberMap(0);

  // Increment indegrees for each edge leading to a vertex
  for (const edge of edges(graph)) {
    indegrees.add(edge.id, 1);
  }

  // Enqueue all vertices with an indegree of 0
  const queue = new QueueMutable<Vertex>();
  let vertexCount = 0;
  for (const vertex of vertices(graph)) {
    if (indegrees.get(vertex.id) === 0) {
      queue.enqueue(vertex);
    }
    vertexCount++;
  }

  const topOrder: Array<Vertex> = [];
  while (!queue.isEmpty) {
    // Add to topological order
    const u = queue.dequeue()!;
    topOrder.push(u);

    // Iterate through neighbours
    for (const neighbour of u.out) {
      const result = indegrees.subtract(neighbour.id, 1);
      if (result === 0) {
        queue.enqueue(graph.vertices.get(neighbour.id)!);
      }
    }
  }

  if (topOrder.length !== vertexCount) {
    throw new Error(`Graph contains cycles`);
  }
  return graphFromVertices(topOrder);
}

/**
 * Create a graph from an iterable of vertices
 * @param vertices 
 * @returns 
 */
export function graphFromVertices(vertices: Iterable<Vertex>): DirectedGraph {
  // eslint-disable-next-line unicorn/no-array-callback-reference, unicorn/no-array-method-this-argument
  const keyValues = Sync.map(vertices, f => {
    return [ f.id, f ] as [ string, Vertex ]
  });
  const m = immutableMap<string, Vertex>([ ...keyValues ]);
  return {
    vertices: m
  }
}

/**
 * Get all the cycles ('strongly-connected-components') within the graph
 * [Read more](https://en.wikipedia.org/wiki/Strongly_connected_component)
 * @param graph 
 * @returns 
 */
export function getCycles(graph: DirectedGraph): Array<Array<Vertex>> {
  let index = 0;
  const stack = new StackMutable<TarjanVertex>();
  const vertices = new Map<string, TarjanVertex>();
  const scc: Array<Array<Vertex>> = [];

  for (const v of graph.vertices.values()) {
    vertices.set(v.id, {
      ...v,
      lowlink: Number.NaN,
      index: Number.NaN,
      onStack: false
    });
  }

  const strongConnect = (vertex: TarjanVertex) => {
    vertex.index = index;
    vertex.lowlink = index;
    index++;
    stack.push(vertex);
    vertex.onStack = true;

    for (const edge of vertex.out) {
      const edgeV = vertices.get(edge.id)!;
      if (Number.isNaN(edgeV.index)) {
        strongConnect(edgeV);
        vertex.lowlink = Math.min(vertex.lowlink, edgeV.lowlink);
      } else if (edgeV.onStack) {
        vertex.lowlink = Math.min(vertex.lowlink, edgeV.lowlink);
      }
    }

    if (vertex.lowlink === vertex.index) {
      const stronglyConnected: Array<Vertex> = [];
      let w: TarjanVertex | undefined;
      while (vertex !== w) {
        w = stack.pop()!;
        w.onStack = false;
        stronglyConnected.push({ id: w.id, out: w.out });

      }
      if (stronglyConnected.length > 1)
        scc.push(stronglyConnected);
    }
  }

  for (const v of vertices.values()) {
    if (Number.isNaN(v.index)) {
      strongConnect(v);
    }
  }
  return scc;
}

/**
 * Returns a new graph which is transitively reduced.
 * That is, redundant edges are removed
 * @param graph 
 * @returns 
 */
export function transitiveReduction(graph: DirectedGraph) {
  for (const u of vertices(graph)) {
    for (const v of adjacentVertices(graph, u)) {
      for (const v1 of dfs(graph, v)) {
        if (v.id === v1.id) continue;
        if (hasOut(graph, u, v1)) {
          const g = disconnect(graph, u, v1);
          return transitiveReduction(g);
        }
      }
    }
  }
  return graph;
}