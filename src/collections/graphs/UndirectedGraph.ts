/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { immutable as immutableMap, type IMapImmutable } from "../../collections/map/Map.js"
import { Table } from "../Table.js"

export type Vertex = Readonly<{
  id: string
}>

export type Edge = Readonly<{
  a: string,
  b: string,
  weight?: number
}>

export type Graph = Readonly<{
  edges: ReadonlyArray<Edge>,
  vertices: IMapImmutable<string, Vertex>
}>

export type ConnectOptions = Readonly<{
  a: string
  b: string | Array<string>
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
  const v = typeof idOrVertex === `string` ? graph.vertices.get(idOrVertex) : idOrVertex;
  if (v === undefined) throw new Error(`Id not found ${ idOrVertex as string }`);
  return v;
}

export const hasConnection = (graph: Graph, a: string | Vertex, b: string | Vertex): boolean => {
  const edge = getConnection(graph, a, b);
  return edge !== undefined;
}

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
 * Connect A <-> B
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

export function connect(graph: Graph, options: ConnectOptions): Graph {
  const { a, weight, b } = options;
  const destinations = Array.isArray(b) ? b : [ b ];

  for (const destination of destinations) {
    const result = connectTo(graph, a, destination, weight);
    graph = result.graph;
  }

  return graph;
}

export const graph = (...initialConnections: Array<ConnectOptions>): Graph => {
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

  // eslint-disable-next-line @typescript-eslint/prefer-for-of, unicorn/prevent-abbreviations
  for (let i = 0; i < v.length; i++) {
    table.setRow(i, v.length, false);

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
const debugGraphToArray = (graph: Graph): Array<string> => {
  const r: Array<string> = [];

  r.push(`Vertices: ${ [ ...graph.vertices.values() ].map(v => v.id).join(`, `) }`);
  // eslint-disable-next-line unicorn/no-array-push-push
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
 * @param graph Graph
 * @param context id or Vertex
 * @returns 
 */
export function* adjacentVertices(graph: Graph, context: Vertex | string | undefined) {
  if (context === undefined) return;
  const vertex = typeof context === `string` ? graph.vertices.get(context) : context;
  if (vertex === undefined) throw new Error(`Vertex not found ${ JSON.stringify(context) }`);

  for (const edge of graph.edges) {
    if (edge.a === context) yield resolveVertex(graph, edge.b);
    else if (edge.b === context) yield resolveVertex(graph, edge.a);
  }
}

export function* edgesForVertex(graph: Graph, context: Vertex | string | undefined) {
  if (context === undefined) return;
  const vertex = typeof context === `string` ? graph.vertices.get(context) : context;
  if (vertex === undefined) throw new Error(`Vertex not found ${ JSON.stringify(context) }`);

  for (const edge of graph.edges) {
    if (edge.a === context) yield edge;
    else if (edge.b === context) yield edge;
  }
}