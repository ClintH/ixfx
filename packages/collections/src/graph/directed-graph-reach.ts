import type { DirectedGraph, Edge, Vertex } from "./directed-graph.js";
import { resultThrow } from "@ixfx/guards";
import { immutableFromOwned } from "../map/map.js";
import { graphTest, resolveVertex } from "./directed-graph-internal.js";

/**
 * Incoming edges, reachability and transposition for directed graphs.
 * Re-exported from `directed-graph.ts`.
 */

type Neighbours = (id: string) => Iterable<string>;

function outNeighbours(graph: DirectedGraph): Neighbours {
  return id => graph.vertices.get(id)?.out.map(edge => edge.id) ?? [];
}

/**
 * Builds `id -> ids of vertices with an edge to id`. O(V+E)
 */
function inNeighbours(graph: DirectedGraph): Neighbours {
  const index = new Map<string, string[]>();
  for (const v of graph.vertices.values()) {
    for (const edge of v.out) {
      const list = index.get(edge.id);
      if (list === undefined)
        index.set(edge.id, [v.id]);
      else list.push(v.id);
    }
  }
  return id => index.get(id) ?? [];
}

/**
 * Breadth-first over ids reachable from `startId` along one or more edges.
 * `startId` itself is only yielded if it is reachable via a cycle.
 */
function* reachableIds(startId: string, next: Neighbours): Generator<string, void, unknown> {
  const seen = new Set<string>();
  let frontier = [...next(startId)];
  while (frontier.length > 0) {
    const nextFrontier: string[] = [];
    for (const id of frontier) {
      if (seen.has(id))
        continue;
      seen.add(id);
      yield id;
      nextFrontier.push(...next(id));
    }
    frontier = nextFrontier;
  }
}

function* idsToVertices(graph: DirectedGraph, ids: Iterable<string>): Generator<Vertex, void, unknown> {
  for (const id of ids) {
    const v = graph.vertices.get(id);
    if (v !== undefined)
      yield v;
  }
}

function prepare(graph: DirectedGraph, idOrVertex: string | Vertex): string {
  resultThrow(graphTest(graph));
  return resolveVertex(graph, idOrVertex).id;
}

/**
 * Iterates over vertices which have an edge to `idOrVertex`.
 *
 * This scans every vertex, so it is O(V+E).
 * If you need incoming edges for many vertices, use {@link transpose} once instead.
 *
 * ```js
 * const g = graph({ from: `a`, to: `c` }, { from: `b`, to: `c` });
 * [...incoming(g, `c`)].map(v => v.id); // [`a`, `b`]
 * ```
 * @param graph Graph
 * @param idOrVertex Vertex to find incoming edges for. Throws if id is not found.
 */
export function* incoming(graph: DirectedGraph, idOrVertex: string | Vertex): Generator<Vertex, void, unknown> {
  const id = prepare(graph, idOrVertex);
  for (const v of graph.vertices.values()) {
    if (v.out.some(edge => edge.id === id))
      yield v;
  }
}

/**
 * Returns the number of edges pointing at `idOrVertex`. O(V+E)
 * @param graph Graph
 * @param idOrVertex Vertex. Throws if id is not found.
 */
export function inDegree(graph: DirectedGraph, idOrVertex: string | Vertex): number {
  const id = prepare(graph, idOrVertex);
  let count = 0;
  for (const v of graph.vertices.values()) {
    for (const edge of v.out) {
      if (edge.id === id)
        count++;
    }
  }
  return count;
}

/**
 * Iterates over every vertex reachable from `idOrVertex` by following edges forwards.
 *
 * The start vertex is only included if it is on a cycle (ie. it can reach itself).
 * Vertices are yielded in breadth-first order.
 * @param graph Graph
 * @param idOrVertex Start vertex. Throws if id is not found.
 */
export function* descendants(graph: DirectedGraph, idOrVertex: string | Vertex): Generator<Vertex, void, unknown> {
  const id = prepare(graph, idOrVertex);
  yield* idsToVertices(graph, reachableIds(id, outNeighbours(graph)));
}

/**
 * Iterates over every vertex that can reach `idOrVertex` by following edges.
 *
 * The vertex itself is only included if it is on a cycle (ie. it can reach itself).
 * Vertices are yielded in breadth-first order, nearest first.
 *
 * Builds a reverse index once, so it is O(V+E).
 * @param graph Graph
 * @param idOrVertex Target vertex. Throws if id is not found.
 */
export function* ancestors(graph: DirectedGraph, idOrVertex: string | Vertex): Generator<Vertex, void, unknown> {
  const id = prepare(graph, idOrVertex);
  yield* idsToVertices(graph, reachableIds(id, inNeighbours(graph)));
}

/**
 * Returns _true_ if `to` can be reached from `from` by following edges.
 *
 * A vertex always has a (zero-length) path to itself, so `hasPath(g, a, a)` is _true_.
 * A useful consequence: adding the edge `from -> to` creates a cycle exactly when `hasPath(g, to, from)`.
 *
 * ```js
 * if (hasPath(g, to, from)) {
 *  // connecting from->to would make a cycle
 * }
 * ```
 * @param graph Graph
 * @param from Start vertex. Throws if not found.
 * @param to Destination vertex. Throws if not found.
 */
export function hasPath(graph: DirectedGraph, from: string | Vertex, to: string | Vertex): boolean {
  const fromId = prepare(graph, from);
  const toId = resolveVertex(graph, to).id;
  if (fromId === toId)
    return true;
  for (const id of reachableIds(fromId, outNeighbours(graph))) {
    if (id === toId)
      return true;
  }
  return false;
}

/**
 * Returns a new graph with every edge reversed. Weights are kept.
 * All vertices are kept, including those without edges.
 *
 * ```js
 * const g = graph({ from: `a`, to: `b` });
 * const t = transpose(g); // b -> a
 * ```
 * @param graph Graph
 */
export function transpose(graph: DirectedGraph): DirectedGraph {
  resultThrow(graphTest(graph));

  const outs = new Map<string, Edge[]>();
  for (const v of graph.vertices.values()) outs.set(v.id, []);
  for (const v of graph.vertices.values()) {
    for (const edge of v.out) {
      const list = outs.get(edge.id) ?? [];
      list.push(edge.weight === undefined ? { id: v.id } : { id: v.id, weight: edge.weight });
      outs.set(edge.id, list);
    }
  }

  const m = new Map<string, Vertex>();
  for (const [id, out] of outs) m.set(id, { id, out });
  return { ...graph, vertices: immutableFromOwned(m) };
}
