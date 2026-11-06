import * as Directed from './directed-graph.js';

/**
 * Excel-style dependency tracking, built on {@link Directed.DirectedGraph}.
 *
 * Edge direction follows the flow of data: an edge `a -> b` means
 * "b depends on a" (a is a _precedent_ of b; b is a _dependent_ of a).
 *
 * Terminology:
 * * _precedents_: nodes a node reads from (Excel: "trace precedents")
 * * _dependents_: nodes that read from a node (Excel: "trace dependents")
 * * _inputs_: nodes with no precedents (the constants of a spreadsheet)
 *
 * All functions are pure; they return new graphs/states rather than mutating.
 */

/**
 * A dependency graph is just a directed graph with data-flow edges.
 */
export type DependencyGraph = Directed.DirectedGraph;

/**
 * Create a dependency graph.
 * Initial entries are `[ node, [ ...precedents ] ]`
 * @example
 * ```js
 * // c = a + b
 * const g = Dependencies.graph([`c`, [`a`, `b`]]);
 * ```
 */
export const graph = (...initial: readonly (readonly [ node: string, precedents: readonly string[] ])[]): DependencyGraph => {
  let g = Directed.graph();
  for (const [ node, precedents ] of initial) {
    g = setPrecedents(g, node, precedents);
  }
  return g;
};

/**
 * Ensures a node exists, with no dependencies.
 */
export const addNode = (g: DependencyGraph, id: string): DependencyGraph => Directed.getOrCreate(g, id).graph;

/**
 * Direct precedents of `id` (nodes it reads from), in graph order.
 * Returns an empty array for unknown nodes.
 */
export const precedentsOf = (g: DependencyGraph, id: string): string[] => {
  const result: string[] = [];
  for (const v of Directed.vertices(g)) {
    if (Directed.vertexHasOut(v, id)) result.push(v.id);
  }
  return result;
};

/**
 * Direct dependents of `id` (nodes that read from it).
 * Returns an empty array for unknown nodes.
 */
export const dependentsOf = (g: DependencyGraph, id: string): string[] => {
  const v = g.vertices.get(id);
  return v === undefined ? [] : v.out.map(e => e.id);
};

/**
 * Walks the graph from `starts`, following `next`, returning every
 * node reached (excluding the starts themselves unless reachable via a cycle).
 * Iterative, so deep chains do not overflow the stack.
 */
const reach = (starts: readonly string[], next: (id: string) => readonly string[]): Set<string> => {
  const seen = new Set<string>();
  const stack = [ ...starts ];
  while (stack.length > 0) {
    const id = stack.pop()!;
    for (const n of next(id)) {
      if (!seen.has(n)) {
        seen.add(n);
        stack.push(n);
      }
    }
  }
  return seen;
};

/**
 * Builds a reverse (precedent) lookup in one pass over the graph.
 */
const reverseIndex = (g: DependencyGraph): Map<string, string[]> => {
  const m = new Map<string, string[]>();
  for (const v of Directed.vertices(g)) {
    if (!m.has(v.id)) m.set(v.id, []);
    for (const e of v.out) {
      const list = m.get(e.id);
      if (list === undefined) m.set(e.id, [ v.id ]);
      else list.push(v.id);
    }
  }
  return m;
};

/**
 * All nodes that transitively depend on `id` (Excel: trace dependents).
 * Does not include `id` itself.
 */
export const allDependents = (g: DependencyGraph, id: string): Set<string> =>
  reach([ id ], n => dependentsOf(g, n));

/**
 * All nodes that `id` transitively depends on (Excel: trace precedents).
 * Does not include `id` itself.
 */
export const allPrecedents = (g: DependencyGraph, id: string): Set<string> => {
  const rev = reverseIndex(g);
  return reach([ id ], n => rev.get(n) ?? []);
};

/**
 * Returns the _inputs_ that a derived value ultimately rests on: the
 * precedents with no precedents of their own. This is where calculation
 * "starts" when tracing back a derived value.
 *
 * If `id` itself has no precedents, it is its own root.
 */
export const rootsOf = (g: DependencyGraph, id: string): string[] => {
  const rev = reverseIndex(g);
  const all = reach([ id ], n => rev.get(n) ?? []);
  if (all.size === 0) return g.vertices.has(id) ? [ id ] : [];
  return [ ...all ].filter(n => (rev.get(n) ?? []).length === 0);
};

/**
 * Returns true if making `node` depend on `precedent` would create a cycle
 * (ie. a circular reference).
 */
export const wouldCycle = (g: DependencyGraph, node: string, precedent: string): boolean => {
  if (node === precedent) return true;
  return allDependents(g, node).has(precedent);
};

/**
 * Declares that `node` depends on `precedent`.
 * Throws if this would create a circular reference.
 */
export const addDependency = (g: DependencyGraph, node: string, precedent: string): DependencyGraph => {
  if (wouldCycle(g, node, precedent)) {
    throw new Error(`Circular reference: '${ node }' cannot depend on '${ precedent }'`);
  }
  return Directed.connect(Directed.getOrCreate(g, node).graph, { from: precedent, to: node });
};

/**
 * Removes the dependency of `node` on `precedent`. Nodes are retained.
 */
export const removeDependency = (g: DependencyGraph, node: string, precedent: string): DependencyGraph => {
  if (!g.vertices.has(node) || !g.vertices.has(precedent)) return g;
  return Directed.disconnect(g, precedent, node);
};

/**
 * Replaces the precedents of `node` wholesale (as when a formula is edited).
 * Throws on circular references, leaving the original graph untouched.
 */
export const setPrecedents = (g: DependencyGraph, node: string, precedents: readonly string[]): DependencyGraph => {
  let result = addNode(g, node);
  const wanted = new Set(precedents);
  for (const old of precedentsOf(result, node)) {
    if (!wanted.has(old)) result = removeDependency(result, node, old);
  }
  for (const p of wanted) {
    result = addDependency(result, node, p);
  }
  return result;
};

/**
 * Orders `nodes` so that every node comes after all of its precedents
 * that are also in `nodes`. Only edges between members are considered,
 * but ordering respects paths through the whole graph.
 * Kahn's algorithm on the induced subgraph.
 * Ties preserve the order given in `nodes`.
 */
const orderSubset = (g: DependencyGraph, nodes: ReadonlySet<string>): string[] => {
  const indegree = new Map<string, number>();
  for (const n of nodes) indegree.set(n, 0);
  for (const n of nodes) {
    for (const d of dependentsOf(g, n)) {
      if (nodes.has(d)) indegree.set(d, indegree.get(d)! + 1);
    }
  }
  const ready = [ ...nodes ].filter(n => indegree.get(n) === 0);
  const ordered: string[] = [];
  let i = 0;
  while (i < ready.length) {
    const n = ready[ i++ ];
    ordered.push(n);
    for (const d of dependentsOf(g, n)) {
      if (!nodes.has(d)) continue;
      const left = indegree.get(d)! - 1;
      indegree.set(d, left);
      if (left === 0) ready.push(d);
    }
  }
  if (ordered.length !== nodes.size) throw new Error(`Graph contains cycles`);
  return ordered;
};

/**
 * The order in which to recalculate after `changed` nodes have new values:
 * every transitive dependent, each after all its precedents.
 * Does not include `changed` themselves (they already have their values),
 * unless one changed node depends on another.
 */
export const recalculationOrder = (g: DependencyGraph, changed: readonly string[]): string[] => {
  const affected = reach(changed, n => dependentsOf(g, n));
  return orderSubset(g, affected);
};

/**
 * The order in which to calculate `target`: all its transitive precedents
 * (inputs first), then `target` itself. Everything outside this is irrelevant to it.
 */
export const calculationOrder = (g: DependencyGraph, target: string): string[] => {
  if (!g.vertices.has(target)) return [];
  const needed = allPrecedents(g, target);
  needed.add(target);
  return orderSubset(g, needed);
};

// ---------------------------------------------------------------------
// Calculation engine
// ---------------------------------------------------------------------

/**
 * Function computing a node's value. `get` reads the current value of a
 * precedent (which must have been declared as a precedent).
 */
export type Formula<V> = (get: (id: string) => V | undefined) => V;

/**
 * Immutable calculation state: a graph, node formulas and cached values.
 * Nodes without a formula are inputs, whose values are set directly.
 */
export type CalcState<V> = Readonly<{
  graph: DependencyGraph
  formulas: ReadonlyMap<string, Formula<V>>
  values: ReadonlyMap<string, V>
  /**
   * Equality used for early cut-off: if a recomputed value equals
   * the old one, its dependents are not recomputed. Default `Object.is`
   */
  equals: (a: V, b: V) => boolean
}>;

/**
 * Result of a state change: the new state and which nodes were
 * actually recomputed (in order). Inputs set directly are not included.
 */
export type CalcResult<V> = Readonly<{
  state: CalcState<V>
  recalculated: readonly string[]
}>;

/**
 * Create an empty calculation state
 */
export const calc = <V>(equals: (a: V, b: V) => boolean = Object.is): CalcState<V> => ({
  graph: graph(),
  formulas: new Map(),
  values: new Map(),
  equals
});

/**
 * Read the cached value of a node
 */
export const getValue = <V>(state: CalcState<V>, id: string): V | undefined => state.values.get(id);

/**
 * Recompute `order` nodes, skipping any whose precedents have all
 * kept their value (early cut-off). `dirty` is the set of nodes whose
 * value changed, which seeds the process.
 */
const propagate = <V>(
  state: CalcState<V>,
  order: readonly string[],
  dirty: ReadonlySet<string>
): CalcResult<V> => {
  const values = new Map(state.values);
  const changed = new Set(dirty);
  const recalculated: string[] = [];
  const get = (id: string) => values.get(id);
  const rev = reverseIndex(state.graph);

  for (const id of order) {
    const formula = state.formulas.get(id);
    if (formula === undefined) continue;
    // Only recompute if at least one precedent really changed
    if (!(rev.get(id) ?? []).some(p => changed.has(p))) continue;

    const next = formula(get);
    recalculated.push(id);
    const had = values.has(id);
    const previous = values.get(id);
    values.set(id, next);
    if (!had || !state.equals(previous as V, next)) changed.add(id);
  }
  return { state: { ...state, values }, recalculated };
};

/**
 * Set the value of an input node. Dependents recompute only if
 * the value differs from the previous one, and only down paths where
 * values actually change.
 *
 * Throws if `id` has a formula.
 */
export const setValue = <V>(state: CalcState<V>, id: string, value: V): CalcResult<V> => {
  if (state.formulas.has(id)) throw new Error(`'${ id }' has a formula; use setFormula to change it`);
  const graphWithNode = addNode(state.graph, id);
  const had = state.values.has(id);
  const unchanged = had && state.equals(state.values.get(id) as V, value);
  const values = new Map(state.values).set(id, value);
  const next: CalcState<V> = { ...state, graph: graphWithNode, values };
  if (unchanged) return { state: next, recalculated: [] };
  return propagate(next, recalculationOrder(graphWithNode, [ id ]), new Set([ id ]));
};

/**
 * Define (or redefine) a node as derived: `formula` reads from `precedents`.
 * The node is calculated immediately, and dependents are updated as needed.
 *
 * Throws on circular references, leaving the original state valid.
 */
export const setFormula = <V>(
  state: CalcState<V>,
  id: string,
  precedents: readonly string[],
  formula: Formula<V>
): CalcResult<V> => {
  const g = setPrecedents(state.graph, id, precedents);
  const formulas = new Map(state.formulas).set(id, formula);
  // Precedents never given a value can't be computed from, so ensure they exist
  const base: CalcState<V> = { ...state, graph: g, formulas };

  // Calculate this node (and any stale precedents it newly relies on) from scratch
  const order = calculationOrder(g, id);
  const values = new Map(state.values);
  const recalculated: string[] = [];
  const get = (n: string) => values.get(n);
  for (const n of order) {
    const f = formulas.get(n);
    if (f === undefined) continue;
    if (n !== id && values.has(n)) continue;
    values.set(n, f(get));
    recalculated.push(n);
  }
  const after: CalcState<V> = { ...base, values };

  // If value of this node changed, propagate to dependents
  const had = state.values.has(id);
  const same = had && state.equals(state.values.get(id) as V, values.get(id) as V);
  if (same) return { state: after, recalculated };
  const downstream = propagate(after, recalculationOrder(g, [ id ]), new Set([ id ]));
  return { state: downstream.state, recalculated: [ ...recalculated, ...downstream.recalculated ] };
};
