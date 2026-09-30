import { topologicalSortGrouped } from "../utils/functions/sorting.js";
import { Disposable } from "./Disposable.js";
import { FrameGraph } from "./FrameGraph.js";
import { Output } from "./io/Output.js";
import { ResourceManager } from "./io/ResourceManager.js";
import { RenderTask } from "./RenderTask.js";
import { Task } from "./Task.js";

/**
 * Retrieves the dependencies of a given task.
 *
 * @param graph - A dependency graph.
 * @param task - A task.
 * @return The live dependencies of the task.
 */

function dependenciesOf(graph: Map<RenderTask, Set<RenderTask>>, task: RenderTask): Set<RenderTask> {

	let dependencies = graph.get(task);

	if(dependencies === undefined) {

		dependencies = new Set();
		graph.set(task, dependencies);

	}

	return dependencies;

}

/**
 * Recursively builds a dependency graph.
 *
 * @param task - The current task node.
 * @param outputToTask - A collection that maps Output instances to active tasks.
 * @param visiting - Keeps track of tasks that are currently being visited to detect cycles.
 * @param graph - The resulting graph.
 */

function buildDependencyGraph(task: RenderTask, outputToTask: Map<Output, RenderTask>,
	visiting: Set<RenderTask>, graph: Map<RenderTask, Set<RenderTask>>): void {

	if(visiting.has(task)) {

		// Cycle.
		return;

	}

	visiting.add(task);

	const dependencies = dependenciesOf(graph, task);

	// Reads: resource → owner → producer.
	for(const texture of task.in.textures.values()) {

		if(texture.owner === null) {

			// External source, no producer.
			continue;

		}

		const producer = outputToTask.get(texture.owner);

		if(producer !== undefined) {

			dependencies.add(producer);

		}

	}

	// Aliases: explicitly shared render targets.
	for(const connection of task.inOut.connections.values()) {

		if(connection.resource.owner === null) {

			// External source, no producer.
			continue;

		}

		const producer = outputToTask.get(connection.resource.owner);

		if(producer === undefined || producer === task) {

			// The producer is not in the graph, or it's the task itself.
			continue;

		}

		switch(connection.loadOp) {

			case "load": {

				// This task depends on the producer's render output.
				dependencies.add(producer);
				break;

			}

			case "clear":
			case "discard": {

				// This task initiates the render target contents, so the producer is the dependent.
				dependenciesOf(graph, producer).add(task);
				// Ensure the producer's own dependencies are resolved.
				buildDependencyGraph(producer, outputToTask, visiting, graph);
				break;

			}

		}

	}

	for(const dependency of dependencies) {

		buildDependencyGraph(dependency, outputToTask, visiting, graph);

	}

	visiting.delete(task);

}

/**
 * A frame graph compiler.
 *
 * @internal
 */

export class FrameGraphCompiler implements Disposable {

	/**
	 * The frame graph to compile.
	 */

	private readonly frameGraph: FrameGraph;

	/**
	 * A resource manager.
	 */

	private readonly resourceManager: ResourceManager;

	/**
	 * A collection of active render tasks and their dependencies.
	 */

	private readonly dependencyGraph: Map<RenderTask, Set<RenderTask>>;

	/**
	 * A collection that maps Output instances to tasks.
	 *
	 * @remarks All tasks in this collection are enabled.
	 */

	private readonly outputToTask: Map<Output, RenderTask>;

	/**
	 * Constructs a new frame graph compiler.
	 *
	 * @param frameGraph - A frame graph.
	 */

	constructor(frameGraph: FrameGraph) {

		this.frameGraph = frameGraph;
		this.resourceManager = new ResourceManager(frameGraph);
		this.dependencyGraph = new Map();
		this.outputToTask = new Map();

	}

	/**
	 * Validates the given task.
	 *
	 * @param task - The task to validate.
	 * @throws If the validation fails.
	 */

	private validateTask(task: RenderTask): void {

		for(const name of task.requiredTextures) {

			if(!task.in.textures.has(name)) {

				throw new Error(`The task "${task.name}" requires the input texture "${name}", but it is not connected.`);

			}

		}

	}

	/**
	 * Validates the given frame graph tasks.
	 *
	 * - Verifies all required resource inputs are connected.
	 * - Verifies all consumed resources have producers.
	 * - Detects missing resources, invalid dependency chains and cycles.
	 *
	 * @param tasks - The tasks to validate.
	 * @throws If the validation fails.
	 */

	private validate(tasks: RenderTask[][]): void {

		for(const executionLevel of tasks) {

			for(const task of executionLevel) {

				this.validateTask(task);

			}

		}

	}

	/**
	 * Builds an executable dependency graph based on the current {@link frameGraph}.
	 *
	 * @return The dependency graph.
	 */

	private buildDependencyGraph(): RenderTask[][] {

		const stack = new Set<RenderTask>();
		const dependencyGraph = this.dependencyGraph;
		const outputToTask = this.outputToTask;

		dependencyGraph.clear();
		outputToTask.clear();

		for(const task of Array.from(this.frameGraph.tasks).filter(x => x.enabled)) {

			outputToTask.set(task.out, task);

		}

		for(const root of Array.from(this.frameGraph.roots).filter(x => x.enabled)) {

			buildDependencyGraph(root, outputToTask, stack, dependencyGraph);

		}

		return topologicalSortGrouped(dependencyGraph);

	}

	/**
	 * Updates the render pipeline.
	 *
	 * @throws If any task or resource connection is invalid.
	 * @return An executable render pipeline.
	 */

	update(): Task[][] {

		const result = this.buildDependencyGraph();
		this.validate(result);
		this.resourceManager.update(result);

		return result;

	}

	/**
	 *
	 */

	updateResolution() {

		// TODO skip rebuilding the graph and only update render targets.

	}

	/**
	 *
	 */

	private getActiveTextures() {

		// TODO per task: find textures that have active consumers and use that to create render targets

	}

	dispose(): void {

		this.resourceManager.dispose();

	}

}
