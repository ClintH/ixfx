import type { IMapImmutable } from "../map/map.js";
import { immutableFromOwned } from "../map/map.js";
import { Table } from "../table.js";

export type Vertex = Readonly<{
  id: string;
}>;

export type Edge = Readonly<{
  a: string;
  b: string;
  weight?: number;
}>;

export type Graph = Readonly<{
  edges: readonly Edge[];
  vertices: IMapImmutable<string, Vertex>;
}>;

export type ConnectOptions = Readonly<{
  a: string;
  b: string | string[];
  weight?: number;
}>;

export function createVertex(id: string): Vertex {
  return {
    id,
  };
}

export function updateGraphVertex(graph: Graph, vertex: Vertex): Graph {
  const gr = {
    ...graph,
    vertices: graph.vertices.set(vertex.id, vertex),
  };
  return gr;
}

export function getOrCreate(graph: Graph, id: string): Readonly<{ graph: Graph; vertex: Vertex }> {
  const v = graph.vertices.get(id);
  if (v !== undefined)
    return { graph, vertex: v };

  const vv = createVertex(id);
  const gg = updateGraphVertex(graph, vv);
  return { graph: gg, vertex: vv };
}

function resolveVertex(graph: Graph, idOrVertex: string | Vertex): Vertex {
  if (typeof idOrVertex !== `string` && typeof idOrVertex !== `object`)
    throw new TypeError(`Param 'idOrVertex' is undefined. Expected string or Vertex. Got: ${typeof idOrVertex}`);
  if (typeof graph !== `object`)
    throw new TypeError(`Param 'graph' is expected to be object. Got: ${typeof graph}`);
  const v = typeof idOrVertex === `string` ? graph.vertices.get(idOrVertex) : idOrVertex;
  if (v === undefined)
    throw new Error(`Id not found ${idOrVertex as string}`);
  return v;
}

/**
 * Returns _true/false_ if there is a connection between `a` and `b` in `graph`.
 * Use {@link getConnection} if you want to the edge.
 * @param graph Graph to search
 * @param a
 * @param b
 * @returns _true_ if edge exists
 */
export function hasConnection(graph: Graph, a: string | Vertex, b: string | Vertex): boolean {
  const edge = getConnection(graph, a, b);
  return edge !== undefined;
}

/**
 * Gets the connection, if it exists between `a` and `b` in `graph`.
 * If it doesn't exist, _undefined_ is returned.
 * Use {@link hasConnection} for a simple true/false if edge exists.
 * @param graph Graph
 * @param a
 * @param b
 * @returns
 */
export function getConnection(graph: Graph, a: string | Vertex, b: string | Vertex): Edge | undefined {
  const aa = resolveVertex(graph, a);
  const bb = resolveVertex(graph, b);
  for (const edge of graph.edges) {
    if (edge.a === aa.id && edge.b === bb.id)
      return edge;
    if (edge.a === bb.id && edge.b === aa.id)
      return edge;
  }
}

/**
 * Key for an edge, regardless of direction
 */
const edgeKey = (a: string, b: string): string => a < b ? `${a}\u0000${b}` : `${b}\u0000${a}`;

/**
 * Makes many connections at once. Vertex map and edge list are each copied at most once,
 * and existing edges are found via a lookup rather than a scan per connection.
 * If nothing changes, `graph` is returned as-is.
 * @param graph Initial graph
 * @param connections List of [a, b, weight]
 * @returns Changed graph and an edge for each connection (existing edge if already connected)
 */
function connectAll(graph: Graph, connections: Iterable<readonly [ a: string, b: string, weight?: number ]>): { graph: Graph; edges: Edge[] } {
  let vertices: Map<string, Vertex> | undefined;
  let lookup: Map<string, Edge> | undefined;
  const added: Edge[] = [];
  const edges: Edge[] = [];

  const ensureVertex = (id: string) => {
    if (vertices === undefined) {
      if (graph.vertices.has(id))
        return;
      vertices = new Map(graph.vertices.entries() as Iterable<[ string, Vertex ]>);
    }
    if (!vertices.has(id))
      vertices.set(id, createVertex(id));
  };

  for (const [a, b, weight] of connections) {
    ensureVertex(a);
    ensureVertex(b);
    if (lookup === undefined) {
      lookup = new Map();
      // Keep first edge for a pair, as getConnection does
      for (const edge of graph.edges) {
        const k = edgeKey(edge.a, edge.b);
        if (!lookup.has(k))
          lookup.set(k, edge);
      }
    }
    const k = edgeKey(a, b);
    let edge = lookup.get(k);
    if (edge === undefined) {
      edge = { a, b, weight };
      lookup.set(k, edge);
      added.push(edge);
    }
    edges.push(edge);
  }

  if (vertices === undefined && added.length === 0)
    return { graph, edges };
  return {
    graph: {
      ...graph,
      vertices: vertices === undefined ? graph.vertices : immutableFromOwned(vertices),
      edges: added.length === 0 ? graph.edges : [...graph.edges, ...added],
    },
    edges,
  };
}

/**
 * Connects A with B, returning the changed graph and created edge.
 * If the connection already exists, the original graph & edge is returned.
 * @param graph
 * @param a
 * @param b
 * @param weight
 * @returns
 */
export function connectTo(graph: Graph, a: string, b: string, weight?: number): { graph: Graph; edge: Edge } {
  const result = connectAll(graph, [[a, b, weight]]);
  return { graph: result.graph, edge: result.edges[0] };
}

/**
 * Converts connection options into a list of [a, b, weight]
 */
function toConnections(options: ConnectOptions): Array<[ string, string, number | undefined ]> {
  const { a, weight, b } = options;
  const destinations = Array.isArray(b) ? b : [b];
  return destinations.map(destination => [a, destination, weight]);
}

/**
 * Makes a connection between `options.a` and one or more nodes in `options.b`.
 * Same as {@link connectWithEdges} but only the {@link Graph} is returned.
 *
 * ```js
 * let g = graph(); // Create an empty graph
 * // Make a connection between `red` and `orange`
 * g = connect(g, { a: `red`, b: `orange` });
 *
 * // Make a connection between `red` and `orange as well as `red` and `yellow`.
 * g = connect(g, { a: `red`, b: [`orange`, `yellow`] })
 * ```
 * @param graph Initial graph
 * @param options Options
 */
export function connect(graph: Graph, options: ConnectOptions): Graph {
  return connectAll(graph, toConnections(options)).graph;
}

/**
 * Makes a connection between `options.a` and one or more nodes in `options.b`.
 * Same as {@link connect} but graph and edges are returned.
 *
 * ```js
 * let g = graph(); // Create an empty graph
 *
 * // Make a connection between `red` and `orange`
 * result = connectWithEdges(g, { a: `red`, b: `orange` });
 *
 * // Make a connection between `red` and `orange as well as `red` and `yellow`.
 * result = connectWithEdges(g, { a: `red`, b: [`orange`, `yellow`] })
 * ```
 * @param graph Initial graph
 * @param options Options
 */
export function connectWithEdges(graph: Graph, options: ConnectOptions): { graph: Graph; edges: Edge[] } {
  return connectAll(graph, toConnections(options));
}

export function graph(...initialConnections: ConnectOptions[]): Graph {
  const empty: Graph = {
    vertices: immutableFromOwned(new Map()),
    edges: [],
  };
  return connectAll(empty, initialConnections.flatMap(toConnections)).graph;
}

export function toAdjacencyMatrix(graph: Graph): Table<boolean> {
  const v = [...graph.vertices.values()];

  const table = new Table<boolean>();
  table.labelColumns(...v.map(vv => vv.id));
  table.labelRows(...v.map(vv => vv.id));

  for (let i = 0; i < v.length; i++) {
    table.setRow(i, false, v.length);

    const ii = v[i];

    for (const [j, jj] of v.entries()) {
      const connected = hasConnection(graph, ii, jj);
      if (connected) {
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
export function dumpGraph(graph: Graph): string {
  const lines = debugGraphToArray(graph);
  return lines.join(`\n`);
}

/**
 * Return an array of a debug-print of every vertex.
 * @param graph
 * @returns
 */
function debugGraphToArray(graph: Graph): string[] {
  const r: string[] = [];

  r.push(`Vertices: ${Array.from(graph.vertices.values(), v => v.id).join(`, `)}`);

  r.push(`Edges:`);
  for (const edge of graph.edges) {
    r.push(stringForEdge(edge));
  }
  return r;
}

function stringForEdge(edge: Edge) {
  const weight = edge.weight ? ` (${edge.weight})` : ``;
  return `${edge.a} <-> ${edge.b}${weight}`;
}

/**
 * Iterate over all the vertices connectd to `context` vertex
 *
 * If `context` is _undefined_, returns nothing
 * @param graph Graph
 * @param context id or Vertex
 * @returns
 */
export function* adjacentVertices(graph: Graph, context: Vertex | string | undefined): Generator<Readonly<{
  id: string;
}>, void, unknown> {
  if (typeof context === `undefined`)
    return;
  const vertex = typeof context === `string` ? graph.vertices.get(context) : context;
  if (typeof vertex === `undefined`)
    throw new Error(`Vertex not found ${JSON.stringify(context)}`);

  for (const edge of graph.edges) {
    if (edge.a === context)
      yield resolveVertex(graph, edge.b);
    else if (edge.b === context)
      yield resolveVertex(graph, edge.a);
  }
}

/**
 * Get all the edges for a vertex.
 *
 * ```js
 * // Iterate all edges for vertex with id '0'
 * for (const edge of edgesForVertex(graph, '0')) {
 * }
 * ```
 *
 * If the vertex has no edges, no values are returned. If the vertex was not found in the graph, an error is thrown.
 * @throws Throws an error if `context` was not found, if it's _undefined_ or `graph` is invalid.
 * @param graph
 * @param context
 * @returns
 */
export function* edgesForVertex(graph: Graph, context: Vertex | string | undefined): Generator<Readonly<{
  a: string;
  b: string;
  weight?: number;
}>, void, unknown> {
  if (typeof graph !== `object`)
    throw new TypeError(`Param 'graph' is expected to be an object. Got: ${typeof graph}`);
  if (typeof context === `undefined`)
    return;
  const vertex = typeof context === `string` ? graph.vertices.get(context) : context;
  if (typeof vertex === `undefined`)
    throw new Error(`Vertex not found ${JSON.stringify(context)}`);

  for (const edge of graph.edges) {
    if (edge.a === context)
      yield edge;
    else if (edge.b === context)
      yield edge;
  }
}