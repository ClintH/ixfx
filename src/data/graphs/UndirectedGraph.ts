/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { QueueMutable, StackMutable } from "../../collections/index.js"
import { PriorityMutable } from "../../collections/queue/PriorityMutable.js"
import { immutable as immutableMap, type IMapImmutable } from "../../collections/map/Map.js"
import { NumberMap } from "../../collections/map/NumberMap.js"
import { Sync } from "../../Generators.js"

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
  b: string
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
    if (edge.b == bb.id && edge.a === aa.id) return edge;
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

  const result = connectTo(graph, a, b, weight);
  graph = result.graph;

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

export function toAdjacencyMatrix(graph: Graph) {
  const v = [ ...graph.vertices.values() ];
  const m: Array<Array<boolean>> = [];
  const row: Array<boolean> = [];
  for (let index = 0; index < v.length; index++) {
    row[ index ] = false;
  }

  // eslint-disable-next-line @typescript-eslint/prefer-for-of, unicorn/prevent-abbreviations
  for (let i = 0; i < v.length; i++) {
    m[ i ] = [ ...row ];
    const ii = v[ i ];
    // eslint-disable-next-line unicorn/prevent-abbreviations
    for (const [ j, jj ] of v.entries()) {
      const connected = hasConnection(graph, ii, jj);
      if (connected) {
        console.log(`Yes ${ ii.id } -> ${ jj.id } i: ${ i } j: ${ j }`);
        m[ i ][ j ] = true;
      } else {
        console.log(`ii: ${ ii.id } jj: ${ jj.id } - ${ i } j: ${ j }`);
      }
    }
  }
  return m;
}
