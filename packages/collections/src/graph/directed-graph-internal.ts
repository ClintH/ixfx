import type { Result } from "@ixfx/guards";
import type { DirectedGraph, Vertex } from "./directed-graph.js";

/**
 * Internal helpers shared by the directed-graph modules. Not part of the public API.
 */

export function graphTest(g: DirectedGraph, parameterName = `graph`): Result<DirectedGraph, string> {
  if (g === undefined)
    return { success: false, error: `Param '${parameterName}' is undefined. Expected Graph` };
  if (g === null)
    return { success: false, error: `Param '${parameterName}' is null. Expected Graph` };
  if (typeof g === `object`) {
    if (!(`vertices` in g)) {
      return {
        success: false,
        error: `Param '${parameterName}.vertices' does not exist. Is it a Graph type?`,
      };
    }
  } else {
    return { success: false, error: `Param '${parameterName} is type '${typeof g}'. Expected an object Graph` };
  }
  return { success: true, value: g };
}

/**
 * Resolves the id or vertex into a Vertex.
 * Throws an error if vertex is not found
 */
export function resolveVertex(graph: DirectedGraph, idOrVertex: string | Vertex): Vertex {
  if (idOrVertex === undefined)
    throw new Error(`Param 'idOrVertex' is undefined. Expected string or Vertex`);

  const v = typeof idOrVertex === `string` ? graph.vertices.get(idOrVertex) : idOrVertex;
  if (v === undefined)
    throw new Error(`Id not found ${idOrVertex as string}`);
  return v;
}
