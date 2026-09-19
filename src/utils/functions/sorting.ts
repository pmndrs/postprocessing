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

function dfs<T>(vertex: T, graph: Map<T, Iterable<T>>, inProgress: Set<T>, completed: Set<T>, result: T[]): void {

	inProgress.add(vertex);

	for(const neighbor of graph.get(vertex) ?? []) {

		if(inProgress.has(neighbor)) {

			throw new Error("A cyclic dependency was detected.");

		}

		if(!completed.has(neighbor)) {

			dfs(neighbor, graph, inProgress, completed, result);

		}

	}

	inProgress.delete(vertex);
	completed.add(vertex);

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
 * @throws If the given graph contains cyclic dependencies.
 * @category Utils
 * @internal
 */

export function topologicalSort<T>(graph: Map<T, Iterable<T>>, desc = false): T[] {

	const result: T[] = [];
	const inProgress = new Set<T>();
	const completed = new Set<T>();

	for(const vertex of graph.keys()) {

		if(!completed.has(vertex)) {

			dfs(vertex, graph, inProgress, completed, result);

		}

	}

	return desc ? result : result.reverse();

}

/**
 * Performs a topological sort on the given graph using Kahn's algorithm.
 *
 * The graph is a map where each key is a vertex and the associated value is a list of vertices that the key depends on.
 * The sorted vertices are grouped into levels that can be executed in parallel: a vertex at level `i` only depends on
 * vertices at levels `0` to `i - 1`, so level `i` may start as soon as all previous levels have finished.
 *
 * Unlike `topologicalSort`, which flattens the graph into a linear order, this preserves the parallelism of the graph
 * by not ordering independent vertices against each other.
 *
 * @see https://en.wikipedia.org/wiki/Topological_sorting#Kahn's_algorithm
 * @param T - The type of the vertices in the graph.
 * @param graph - The graph to sort.
 * @return The sorted vertices, grouped by execution level.
 * @throws If the given graph contains cyclic dependencies.
 * @category Utils
 * @internal
 */

export function topologicalSortGrouped<T>(graph: Map<T, Iterable<T>>): T[][] {

	const result: T[][] = [];

	// Reverse adjacency: for each vertex, the vertices that depend on it.
	const dependents = new Map<T, T[]>();

	// For each vertex, how many of its dependencies are still unscheduled.
	const dependencyCount = new Map<T, number>();

	// A single pass over all edges: register every vertex and build both tables.
	for(const [vertex, dependencies] of graph) {

		// Keep any entries already created when the vertex appeared as a dependency.
		dependents.set(vertex, dependents.get(vertex) ?? []);
		dependencyCount.set(vertex, dependencyCount.get(vertex) ?? 0);

		for(const dependency of dependencies) {

			// The dependency may only appear as a value, so ensure it is registered.
			dependents.set(dependency, dependents.get(dependency) ?? []);
			dependencyCount.set(dependency, dependencyCount.get(dependency) ?? 0);

			// Count this edge toward the vertex's pending dependency total.
			dependencyCount.set(vertex, (dependencyCount.get(vertex) ?? 0) + 1);

			// Record the reverse edge: the vertex is a dependent of this dependency.
			dependents.get(dependency)!.push(vertex);

		}

	}

	// Seed level zero with every vertex that has no dependencies.
	let current: T[] = [];

	for(const vertex of dependencyCount.keys()) {

		if(dependencyCount.get(vertex) === 0) {

			current.push(vertex);

		}

	}

	let processed = 0;

	// Peel off one parallel level per iteration until nothing is left.
	while(current.length > 0) {

		// All vertices in "current" are mutually independent, so they form one level.
		result.push(current);
		processed += current.length;

		const next: T[] = [];

		for(const vertex of current) {

			for(const dependent of dependents.get(vertex) ?? []) {

				// Release this vertex from the dependent's pending dependency total.
				const count = (dependencyCount.get(dependent) ?? 1) - 1;
				dependencyCount.set(dependent, count);

				if(count === 0) {

					// Fully scheduled: the dependent joins the next level.
					next.push(dependent);

				}

			}

		}

		current = next;

	}

	// Any vertex that was never scheduled must be part of a cycle.
	if(processed < dependencyCount.size) {

		throw new Error("A cyclic dependency was detected.");

	}

	return result;

}
