/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { IStackMutable } from "src/collections/stack/IStackMutable.js"
import { StackMutable } from "../collections/index.js"
import { PriorityMutable } from "../collections/queue/PriorityMutable.js"

export type Vertex = Readonly<{
  in?: ReadonlyArray<Edge>
  out?: ReadonlyArray<Edge>
  id: string
}>

export type Edge = Readonly<{
  id: string,
  weight?: number
}>

export const createVertex = (id: string): Vertex => {
  return {
    id
  }
}

export type ConnectOptions = Readonly<{
  from: string
  to: string
  bidi?: boolean
  weight?: number
  throwIfMissing?: boolean
}>

export class Graph {
  vertices = new Map<string, Vertex>();

  distance(edge: Edge) {
    if (edge.weight !== undefined) return edge.weight;
    return 1;
  }

  *adjacentVertices(v: Vertex | string | undefined) {
    if (v === undefined) return;
    const vertex = (typeof v === `string`) ? this.vertices.get(v) : v;
    if (vertex === undefined) throw new Error(`Vertex not found ${ JSON.stringify(v) }`);
    if (vertex.out === undefined) return;
    for (const edge of vertex.out) {
      const edgeV = this.vertices.get(edge.id);
      if (edgeV === undefined) throw new Error(`Could not find vertex: ${ edge.id }`);
      yield edgeV;
    }

  }

  hasOut(contextId: string, id: string) {
    const context = this.vertices.get(contextId);
    if (context === undefined) return false;
    if (context.out === undefined) return false;
    return context.out.some(edge => edge.id === id);
  }

  hasIn(contextId: string, id: string) {
    const context = this.vertices.get(contextId);
    if (context === undefined) return false;
    if (context.in === undefined) return false;
    return context.in.some(edge => edge.id === id);
  }

  getOrCreate(id: string, throwIfMissing = false): Vertex {
    const v = this.vertices.get(id);
    if (v !== undefined) return v;
    if (throwIfMissing) throw new Error(`Id not found: ${ id }`);
    const vv = createVertex(id);
    this.vertices.set(id, vv);
    return vv;
  }

  update(vertex: Vertex) {
    this.vertices.set(vertex.id, vertex);
  }

  connect(options: ConnectOptions) {
    const { to, weight, from } = options;
    const bidi = options.bidi ?? true;
    const throwIfMissing = options.throwIfMissing ?? true;
    const edge: Edge = {
      id: to,
      weight
    };

    let fromNode = this.getOrCreate(from, throwIfMissing);
    if (!hasOut(fromNode, to)) {
      fromNode = {
        ...fromNode,
        out: [ ... (fromNode.out ?? []), edge ]
      };
      this.update(fromNode);
    }
    if (!bidi) return;

    let toNode = this.getOrCreate(to, throwIfMissing);
    if (!hasIn(toNode, from)) {
      toNode = {
        ...toNode,
        in: [ ... (toNode.in ?? []), { id: from, weight } ]
      }
      this.update(toNode);
    }
  }

  dump(): Array<string> {
    const r: Array<string> = [];
    for (const v of this.vertices.values()) {
      // eslint-disable-next-line unicorn/prevent-abbreviations
      const str = debugDumpVertex(v);
      r.push(...str.map(line => ` ${ line }`));
    }
    return r;
  }
}

export const hasOut = (context: Vertex, fromId: string) => {
  if (context.out === undefined) return false;
  return context.out.some(edge => {
    return edge.id === fromId;
  });
}

export const hasIn = (context: Vertex, inId: string) => {
  if (context.in === undefined) return false;
  return context.in.some(edge => {
    return edge.id === inId
  });
}

export type DistanceCompute = (graph: Graph, edge: Edge) => number;

export const distanceDefault = (graph: Graph, edge: Edge): number => {
  if (edge.weight !== undefined) return edge.weight;
  return 1;
}



export const debugDumpVertex = (v: Vertex): Array<string> => {
  const r = [
    `${ v.id }`
  ]
  const stringForEdge = (edge: Edge) => `${ edge.id } (${ edge.weight ?? `? ` })`
  if (v.in) {
    for (const edge of v.in) {
      r.push(` <- ${ stringForEdge(edge) }`);
    }
  }
  if (v.out) {
    for (const edge of v.out) {
      r.push(` -> ${ stringForEdge(edge) })`);
    }
  }

  return r;
}

export function isAdjacentVertices(a: Vertex, b: Vertex) {
  if (hasOut(a, b.id)) return true;
  if (hasOut(b, a.id)) return true;
}


export function* dfs(graph: Graph, startId: string) {
  const source = graph.getOrCreate(startId, true);
  const s = new StackMutable<Vertex>();
  const seen = new Set<string>();
  s.push(source);
  while (!s.isEmpty) {
    const v = s.pop();
    if (v === undefined) continue;
    if (!seen.has(v.id)) {
      seen.add(v.id);
      yield v;
      for (const edge of (v.out ?? [])) {
        const destination = graph.vertices.get(edge.id);
        if (destination) {
          s.push(destination);
        }
      }
    }
  }
}

export const findCycles = (graph: Graph) => {
  const visited = new Set<string>();

  const printCycle = (stack: IStackMutable<Vertex>, v: Vertex, detectedCycles: Array<any>) => {
    const cycle = new StackMutable<Vertex>();
    if (!stack.isEmpty) cycle.push(stack.pop()!);
    while (!stack.isEmpty && stack.peek?.id !== v.id) {

      const pp = stack.pop();
      if (pp !== undefined) {
        cycle.push(pp);
      }
      console.log(` next peek: v: ${ v.id } next: ${ stack.peek?.id }`);
    }
    if (!cycle.isEmpty) {
      console.log(`printCycle: ${ v.id }`);
      detectedCycles.push(...cycle.data.map(v => v.id), v.id);
    };
  }

  const processTree = (stack: IStackMutable<Vertex>, detectedCycles: Array<any>) => {
    let v = stack.peek;
    //console.log(`processTree. Stack: ${ JSON.stringify(stack.data) }`);
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain

    for (const adj of graph.adjacentVertices(v)) {
      if (visited.has(adj.id)) {
        console.log(`Visited before: ${ adj.id }`);
        printCycle(stack, adj, detectedCycles);
      } else {
        console.log(`Not visited before: ${ adj.id }`);
        stack.push(graph.getOrCreate(adj.id));
        visited.add(adj.id);
        processTree(stack, detectedCycles);
      }
    }

    v = stack.peek;
    if (v !== undefined) {
      console.log(` deleting from visited: ${ v.id }`)
      visited.delete(v.id);
      stack.pop();
    } else {
      console.log(`  can't delete`);
    }
  }

  for (const v of graph.vertices.values()) {
    console.log(`vertex: ${ v.id }`);
    if (!visited.has(v.id)) {
      const stack = new StackMutable<Vertex>();
      stack.push(v);
      visited.add(v.id);
      const detectedCycles: Array<any> = [];
      processTree(stack, detectedCycles);
      console.log(`cycle`, detectedCycles);
    }
  }

}

export const dijkstraPath = (graph: Graph, source: Vertex) => {
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
    console.log(pq.data);
    const u = pq.dequeueMin();
    if (u === undefined) throw new Error(`Bug. Queue unexpectedly empty`);
    const vertexU = graph.vertices.get(u)!;
    for (const neighbour of (vertexU.out ?? [])) {
      //const vertexNeigbour = graph.vertices.get(neighbour.to)!;
      const alt = distances.get(u)! + graph.distance(neighbour);
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