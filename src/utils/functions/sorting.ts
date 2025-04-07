/**
 * Performs a depth first search from the given vertex.
 *
 * @param T - The type of the vertices in the graph.
 * @param vertex - The starting vertex.
 * @param graph - The graph to process.
 * @param visited - A set of visited vertices.
 * @param result - A list to store the sorted vertices in.
 * @category Utils
 * @internal
 */

function dfs<T>(vertex: T, graph: Map<T, Iterable<T>>, visited: Set<T>, result: T[]): void {

	visited.add(vertex);

	for(const neighbor of graph.get(vertex) ?? []) {

		if(!visited.has(neighbor)) {

			dfs(neighbor, graph, visited, result);

		}

	}

	// Add the vertex to the result after every neighbor has been visited.
	result.push(vertex);

}

/**
 * Performs a topological sort on the given graph.
 *
 * The graph is a map where each key is a vertex and the associated value is a list of neighbors.
 *
 * @see https://medium.com/cracking-the-coding-interview-in-ruby-python-and/topological-sort-in-javascript-ruby-and-python-mastering-algorithms-c04c20f88bd5
 * @param T - The type of the vertices in the graph.
 * @param graph - The graph to sort.
 * @param desc - Whether the vertices should be sorted in descending order.
 * @return The sorted vertices.
 * @category Utils
 * @internal
 */

export function topologicalSort<T>(graph: Map<T, Iterable<T>>, desc = false): T[] {

	const result: T[] = [];
	const visited = new Set<T>();

	for(const vertex of graph.keys()) {

		if(!visited.has(vertex)) {

			dfs(vertex, graph, visited, result);

		}

	}

	return desc ? result : result.reverse();

}
