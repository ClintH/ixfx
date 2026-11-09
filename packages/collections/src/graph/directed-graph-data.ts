import type { IMapImmutable } from "../map/map.js";
import type { EitherKey } from "../types.js";
import type { DirectedGraph, Edge, Vertex } from "./directed-graph.js";
import { resultThrow } from "@ixfx/guards";
import { immutableFromOwned } from "../map/map.js";
import { graphTest } from "./directed-graph-internal.js";

/**
 * Batch mutation and plain-data (de)serialisation for directed graphs.
 * Re-exported from `directed-graph.ts`.
 */

const draftUsedAfterError = () => new Error(`Graph draft used after withMutations completed. Use the graph returned by withMutations instead.`);

/**
 * An IMapImmutable-shaped wrapper that lazily copies `source` on first change.
 * Every 'change' mutates the copy in place and returns the same wrapper, so existing
 * graph functions keep working but each change is O(1) rather than O(V).
 *
 * Once `seal()` is called, any further change throws. This catches drafts leaking
 * out of {@link withMutations}.
 */
function draftMap(source: IMapImmutable<string, Vertex>) {
  let live = true;
  let data: Map<string, Vertex> | undefined;
  const writable = (): Map<string, Vertex> => {
    if (!live)
      throw draftUsedAfterError();
    data ??= new Map(source.entries() as Iterable<[string, Vertex]>);
    return data;
  };
  const self: IMapImmutable<string, Vertex> = {
    add: (...items: EitherKey<string, Vertex>) => {
      const d = writable();
      for (const item of items) {
        if (Array.isArray(item)) {
          d.set(item[0], item[1]);
        } else {
          const kv = item as { key: string; value: Vertex };
          d.set(kv.key, kv.value);
        }
      }
      return self;
    },
    set: (key, value) => {
      writable().set(key, value);
      return self;
    },
    delete: (key) => {
      if (live && !self.has(key))
        return self; // Nothing to delete, avoid copying
      writable().delete(key);
      return self;
    },
    clear: () => {
      // Replace rather than copy-then-clear
      writable();
      data = new Map();
      return self;
    },
    get: key => data === undefined ? source.get(key) : data.get(key),
    has: key => data === undefined ? source.has(key) : data.has(key),
    entries: () => data === undefined ? source.entries() : data.entries(),
    values: () => data === undefined ? source.values() : data.values(),
    isEmpty: () => data === undefined ? source.isEmpty() : data.size === 0,
  };
  return {
    map: self,
    /** The copy, or _undefined_ if nothing was changed */
    changed: () => data,
    isLive: () => live,
    seal: () => {
      live = false;
    },
  };
}

/**
 * Draft maps currently or previously handed out by {@link withMutations},
 * mapped to whether they are still live.
 */
const drafts = new WeakMap<object, () => boolean>();

/**
 * Applies many changes to a graph at once, copying the underlying data at most once.
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
 * If nothing is changed, `graph` is returned.
 * Calling `withMutations` on a draft (ie. nested) runs `fn` directly on that draft.
 * @param graph Starting graph
 * @param fn Callback that changes and returns the draft
 * @returns New, immutable graph
 */
export function withMutations(graph: DirectedGraph, fn: (draft: DirectedGraph) => DirectedGraph): DirectedGraph {
  resultThrow(graphTest(graph));

  const isLive = drafts.get(graph.vertices);
  if (isLive !== undefined) {
    if (!isLive())
      throw draftUsedAfterError();
    // Already inside a batch: changes go straight into the outer draft
    const result = fn(graph);
    resultThrow(graphTest(result, `withMutations result`));
    return result;
  }

  const draft = draftMap(graph.vertices);
  drafts.set(draft.map, draft.isLive);
  try {
    const result = fn({ ...graph, vertices: draft.map });
    resultThrow(graphTest(result, `withMutations result`));
    // Callback returned some other (immutable) graph
    if (result.vertices !== draft.map)
      return result;
    const changed = draft.changed();
    if (changed === undefined)
      return graph;
    // Draft is sealed below, so nothing else can change `changed`. No need to copy it.
    return { ...result, vertices: immutableFromOwned(changed) };
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
  return { vertices: immutableFromOwned(m) };
}
