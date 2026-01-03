
import { immutable as immutableMap, type IMapImmutable } from "../map/map.js"
import { Table } from "../table.js"

export type Vertex = Readonly<{
  id: string
}>

export type Edge = Readonly<{
  a: string,
  b: string,
  weight?: number
}>

export type Graph = Readonly<{
  edges: readonly Edge[],
  vertices: IMapImmutable<string, Vertex>
}>

export type ConnectOptions = Readonly<{
  a: string
  b: string | string[]
  weight?: number
}>

export const createVertex = (id: string): Vertex => {
  return {
    id
  }
}

export const updateGraphVertex = (graph: Graph, vertex: Vertex): Graph => {
  const gr = {
    ...graph,
    vertices: graph.vertices.set(vertex.id, vertex)
  }
  return gr;
}

export const getOrCreate = (graph: Graph, id: string): Readonly<{ graph: Graph, vertex: Vertex }> => {
  const v = graph.vertices.get(id);
  if (v !== undefined) return { graph, vertex: v };

  const vv = createVertex(id);
  const gg = updateGraphVertex(graph, vv);
  return { graph: gg, vertex: vv };
}

function resolveVertex(graph: Graph, idOrVertex: string | Vertex): Vertex {
  if (typeof idOrVertex !== `string` && typeof idOrVertex !== `object`) throw new TypeError(`Param 'idOrVertex' is undefined. Expected string or Vertex. Got: ${ typeof idOrVertex }`);
  if (typeof graph !== `object`) throw new TypeError(`Param 'graph' is expected to be object. Got: ${ typeof graph }`);
  const v = typeof idOrVertex === `string` ? graph.vertices.get(idOrVertex) : idOrVertex;
  if (v === undefined) throw new Error(`Id not found ${ idOrVertex as string }`);
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
export const hasConnection = (graph: Graph, a: string | Vertex, b: string | Vertex): boolean => {
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
export const getConnection = (graph: Graph, a: string | Vertex, b: string | Vertex): Edge | undefined => {
  const aa = resolveVertex(graph, a);
  const bb = resolveVertex(graph, b);
  for (const edge of graph.edges) {
    if (edge.a == aa.id && edge.b === bb.id) return edge;
    if (edge.a == bb.id && edge.b === aa.id) return edge;
  }
  return;
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
export function connectTo(graph: Graph, a: string, b: string, weight?: number): { graph: Graph, edge: Edge } {
  const aResult = getOrCreate(graph, a);
  graph = aResult.graph;
  const bResult = getOrCreate(graph, b);
  graph = bResult.graph;

  let edge = getConnection(graph, a, b);
  if (edge !== undefined) return { graph, edge };
  edge = {
    a,
    b,
    weight
  }

  const graphChanged: Graph = {
    ...graph,
    edges: [ ...graph.edges, edge ]
  }
  return { graph: graphChanged, edge }
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
  const result = connectWithEdges(graph, options);
  return result.graph;
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
export function connectWithEdges(graph: Graph, options: ConnectOptions): { graph: Graph, edges: Edge[] } {
  const { a, weight, b } = options;
  const destinations = Array.isArray(b) ? b : [ b ];
  const edges: Edge[] = [];
  for (const destination of destinations) {
    const result = connectTo(graph, a, destination, weight);
    graph = result.graph;
    edges.push(result.edge);
  }

  return { graph, edges };
}

export const graph = (...initialConnections: ConnectOptions[]): Graph => {
  let g: Graph = {
    vertices: immutableMap(),
    edges: []
  }
  for (const ic of initialConnections) {
    g = connect(g, ic);
  }
  return g;
}

export function toAdjacencyMatrix(graph: Graph): Table<boolean> {
  const v = [ ...graph.vertices.values() ];

  const table = new Table<boolean>();
  table.labelColumns(...v.map(vv => vv.id));
  table.labelRows(...v.map(vv => vv.id));

  // eslint-disable-next-line unicorn/prevent-abbreviations
  for (let i = 0; i < v.length; i++) {
    table.setRow(i, false, v.length);

    const ii = v[ i ];
    // eslint-disable-next-line unicorn/prevent-abbreviations
    for (const [ j, jj ] of v.entries()) {
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
export const dumpGraph = (graph: Graph): string => {
  const lines = debugGraphToArray(graph);
  return lines.join(`\n`);
}

/**
 * Return an array of a debug-print of every vertex.
 * @param graph 
 * @returns 
 */
const debugGraphToArray = (graph: Graph): string[] => {
  const r: string[] = [];

  r.push(`Vertices: ${ [ ...graph.vertices.values() ].map(v => v.id).join(`, `) }`);

  r.push(`Edges:`);
  for (const edge of graph.edges) {
    r.push(stringForEdge(edge));
  }
  return r;
}

const stringForEdge = (edge: Edge) => {
  const weight = edge.weight ? ` (${ edge.weight })` : ``;
  return `${ edge.a } <-> ${ edge.b }${ weight }`
}

/**
 * Iterate over all the vertices connectd to `context` vertex
 * 
 * If `context` is _undefined_, returns nothing
 * @param graph Graph
 * @param context id or Vertex
 * @returns 
 */
export function* adjacentVertices(graph: Graph, context: Vertex | string | undefined) {
  if (typeof context === `undefined`) return;
  const vertex = typeof context === `string` ? graph.vertices.get(context) : context;
  if (typeof vertex === `undefined`) throw new Error(`Vertex not found ${ JSON.stringify(context) }`);

  for (const edge of graph.edges) {
    if (edge.a === context) yield resolveVertex(graph, edge.b);
    else if (edge.b === context) yield resolveVertex(graph, edge.a);
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
export function* edgesForVertex(graph: Graph, context: Vertex | string | undefined) {
  if (typeof graph !== `object`) throw new TypeError(`Param 'graph' is expected to be an object. Got: ${ typeof graph }`);
  if (typeof context === `undefined`) return;
  const vertex = typeof context === `string` ? graph.vertices.get(context) : context;
  if (typeof vertex === `undefined`) throw new Error(`Vertex not found ${ JSON.stringify(context) }`);

  for (const edge of graph.edges) {
    if (edge.a === context) yield edge;
    else if (edge.b === context) yield edge;
  }
}