/**
 * Directed graphs
 * 
 * Graph _vertices_ (ie. nodes) connect to each other along _edges_.
 * This is 'directed' in that connections are not necessarily mutual.
 * A can connect to B without B connecting to A.
 * 
 * Connections can have an optional weight, defaulting to 1.
 * 
 * @example Creating a directed graph A connects to B and C; B connects to C. C has edges.
 * ```js
 * let g = Directed.graph(
 *  { from: `a`, to: [`b`, `c`] },
 *  { from: `b`, to: `c` }
*  );
* ```
* 
* Graphs do not store data directly, only the relation between vertices. Each vertex has an id,
* so to associate data, use a map along with the graph.
*
*/
export * as Directed from './directed-graph.js';

/**
 * Undirected graphs
 * 
 * Graph _vertices_ (ie. nodes) connect to each other along _edges_.
 * Unlike a directed graph, nodes are always mutually connected.
 * 
 * @example Creating an undirected graph where vertex 0 connects to 1, 2 & 3; 2 connects to 1
 * ```js
 * let g = Undirected.graph(
 *    { a: `0`, b: [ `1`, `2`, `3` ] },
 *    { a: `2`, b: `1` }
 *  );
* ```
* 
* Graphs do not store data directly, only the relation between vertices. Each vertex has an id,
* so to associate data, use a map along with the graph.
*
*/
export * as Undirected from './undirected-graph.js';