import type { IMapImmutable } from "../map/map.js";
import type { EitherKey } from "../types.js";
import type { DirectedGraph, Edge, Vertex } from "./directed-graph.js";
import { resultThrow } from "@ixfx/guards";
import { immutable as immutableMap } from "../map/map.js";
import { graphTest } from "./directed-graph-internal.js";

/**
 * Batch mutation and plain-data (de)serialisation for directed graphs.
 * Re-exported from `directed-graph.ts`.
 */

/**
 * An IMapImmutable-shaped wrapper over a single mutable Map.
 * Every 'change' mutates in place and returns the same wrapper, so existing
 * graph functions keep working but each change is O(1) rather than O(V).
 *
 * Once `seal()` is called, any further change throws. This catches drafts leaking
 * out of {@link withMutations}.
 */
function draftMap(data: Map<string, Vertex>) {
  let live = true;
  const alive = () => {
    if (!live)
      throw new Error(`Graph draft used after withMutations completed. Use the graph returned by withMutations instead.`);
  };
  const self: IMapImmutable<string, Vertex> = {
    add: (...items: EitherKey<string, Vertex>) => {
      alive();
      for (const item of items) {
        if (Array.isArray(item)) {
          data.set(item[0], item[1]);
        } else {
          const kv = item as { key: string; value: Vertex };
          data.set(kv.key, kv.value);
        }
      }
      return self;
    },
    set: (key, value) => {
      alive();
      data.set(key, value);
      return self;
    },
    delete: (key) => {
      alive();
      data.delete(key);
      return self;
    },
    clear: () => {
      alive();
      data.clear();
      return self;
    },
    get: key => data.get(key),
    has: key => data.has(key),
    entries: () => data.entries(),
    values: () => data.values(),
    isEmpty: () => data.size === 0,
  };
  return { map: self, seal: () => {
    live = false;
  } };
}

/**
 * Applies many changes to a graph at once, copying the underlying data only once
 * at the start and once at the end.
 *
 * Normally each change (eg. {@link connect}) copies the whole vertex map, which is O(V).
 * Building a graph edge-by-edge is therefore O(V·E). Inside `withMutations` each change is O(1).
 *
 * The callback gets a _draft_ graph and must return the final graph.
 * Use the normal graph functions on the draft and keep the graph each one returns.
 *
 * ```js
 * const g2 = withMutations(g, draft => {
 *  for (const [from, to] of pairs) {
 *    draft = connect(draft, { from, to });
 *  }
 *  return draft;
 * });
 * ```
 *
 * Caveats:
 * Inside the callback, intermediate graphs share storage, so an earlier reference
 *   _will_ see later changes. Don't keep intermediate graphs around.
 * Using the draft after `withMutations` returns throws an error.
 * `graph` itself is never modified.
 * @param graph Starting graph
 * @param fn Callback that changes and returns the draft
 * @returns New, immutable graph
 */
export function withMutations(graph: DirectedGraph, fn: (draft: DirectedGraph) => DirectedGraph): DirectedGraph {
  resultThrow(graphTest(graph));

  const draft = draftMap(new Map(graph.vertices.entries()));
  try {
    const result = fn({ ...graph, vertices: draft.map });
    resultThrow(graphTest(result, `withMutations result`));
    return { ...result, vertices: immutableMap(new Map(result.vertices.entries())) };
  } finally {
    draft.seal();
  }
}

/**
 * Plain-data form of an {@link Edge}
 */
export type EdgeJson = { id: string; weight?: number };

/**
 * Plain-data form of a {@link DirectedGraph}.
 * Safe to use with `JSON.stringify`, `structuredClone` and `postMessage`.
 */
export type DirectedGraphJson = {
  vertices: Array<{ id: string; out: EdgeJson[] }>;
};

/**
 * Returns the graph as plain data, suitable for `JSON.stringify`,
 * `structuredClone` or `postMessage`. Use {@link fromJson} to get a graph back.
 *
 * Vertex order is preserved. `weight` is omitted when not set.
 *
 * ```js
 * const text = JSON.stringify(toJson(g));
 * const g2 = fromJson(JSON.parse(text));
 * ```
 * @param graph Graph
 */
export function toJson(graph: DirectedGraph): DirectedGraphJson {
  resultThrow(graphTest(graph));

  const vertices = Array.from(graph.vertices.values(), v => ({
    id: v.id,
    out: v.out.map(edge => edge.weight === undefined ? { id: edge.id } : { id: edge.id, weight: edge.weight }),
  }));
  return { vertices };
}

function edgeFromJson(raw: unknown, vertexId: string): Edge {
  if (typeof raw !== `object` || raw === null)
    throw new TypeError(`Vertex '${vertexId}' has an edge that is not an object`);
  const { id, weight } = raw as Record<string, unknown>;
  if (typeof id !== `string` || id.length === 0)
    throw new TypeError(`Vertex '${vertexId}' has an edge without a valid 'id'`);
  if (weight === undefined)
    return { id };
  if (typeof weight !== `number` || Number.isNaN(weight))
    throw new TypeError(`Edge '${vertexId}' -> '${id}' has a non-numeric weight`);
  return { id, weight };
}

function vertexFromJson(raw: unknown, index: number): Vertex {
  if (typeof raw !== `object` || raw === null)
    throw new TypeError(`Vertex at index ${index} is not an object`);
  const { id, out } = raw as Record<string, unknown>;
  if (typeof id !== `string` || id.length === 0)
    throw new TypeError(`Vertex at index ${index} lacks a valid 'id'`);
  if (out !== undefined && !Array.isArray(out))
    throw new TypeError(`Vertex '${id}' has 'out' that is not an array`);

  // Keep the first edge to each destination, same as `connect`
  const edges = new Map<string, Edge>();
  for (const e of (out ?? []) as unknown[]) {
    const edge = edgeFromJson(e, id);
    if (!edges.has(edge.id))
      edges.set(edge.id, edge);
  }
  return { id, out: [...edges.values()] };
}

/**
 * Creates a graph from the plain-data form produced by {@link toJson}.
 *
 * Input is validated, since it typically comes from `JSON.parse` or `postMessage`.
 * Throws if a vertex id appears twice, or ids/weights are of the wrong type
 * Edges to ids that aren't listed as vertices create those vertices (as {@link connect} does)
 * Duplicate edges between the same pair of vertices are collapsed, keeping the first
 * @param json Plain-data graph
 */
export function fromJson(json: DirectedGraphJson): DirectedGraph {
  if (typeof json !== `object` || json === null)
    throw new TypeError(`Param 'json' should be an object. Got: ${typeof json}`);
  if (!Array.isArray(json.vertices))
    throw new TypeError(`Param 'json.vertices' should be an array`);

  const m = new Map<string, Vertex>();
  for (const [index, raw] of (json.vertices as unknown[]).entries()) {
    const v = vertexFromJson(raw, index);
    if (m.has(v.id))
      throw new Error(`Vertex id '${v.id}' appears more than once`);
    m.set(v.id, v);
  }
  // Create any vertices only referred to by edges
  for (const v of [...m.values()]) {
    for (const edge of v.out) {
      if (!m.has(edge.id))
        m.set(edge.id, { id: edge.id, out: [] });
    }
  }
  return { vertices: immutableMap(m) };
}
