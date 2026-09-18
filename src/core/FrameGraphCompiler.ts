import { topologicalSort } from "../utils/functions/sorting.js";
import { Disposable } from "./Disposable.js";
import { FrameGraph } from "./FrameGraph.js";
import { Output } from "./io/Output.js";
import { ResourceManager } from "./io/ResourceManager.js";
import { RenderTask } from "./RenderTask.js";
import { Task } from "./Task.js";

/**
 * Recursively builds a dependency graph.
 *
 * @param task - The current task node.
 * @param outputToTask - A collection that maps Output instances to active tasks.
 * @param result - The resulting graph.
 */

function buildDependencyGraph(task: RenderTask, outputToTask: Map<Output, RenderTask>,
	stack: WeakSet<RenderTask>, result: Map<RenderTask, Set<RenderTask>>): void {

	if(stack.has(task)) {

		// Cycle; topologicalSort reports it.
		return;

	}

	stack.add(task);

	if(!result.has(task)) {

		result.set(task, new Set());

	}

	const dependencies = result.get(task)!;

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

		const owner = connection.resource.owner;

		if(owner === null) {

			// External source, no producer.
			continue;

		}

		const producer = outputToTask.get(owner);

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

				// This task initiates the render target contents.
				if(!result.has(producer)) {

					result.set(producer, new Set());

				}

				result.get(producer)!.add(task);
				// Ensure the producer's own dependencies are resolved.
				buildDependencyGraph(producer, outputToTask, stack, result);
				break;

			}

		}

	}

	for(const dependency of dependencies) {

		buildDependencyGraph(dependency, outputToTask, stack, result);

	}

	stack.delete(task);

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
	 * A collection of active render tasks and their depdendencies.
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
	 * Validates the current frame graph tasks.
	 *
	 * - Verifies all required resource inputs are connected.
	 * - Verifies all consumed resources have producers.
	 * - Detects missing resources, invalid dependency chains and cycles.
	 */

	private validate(tasks: Iterable<RenderTask>): void {

		for(const task of tasks) {

			for(const name of task.requiredTextures) {

				if(!task.in.textures.has(name)) {

					throw new Error(`The task "${task.name}" requires the input texture "${name}", but it is not connected.`);

				}

			}

		}

	}

	/**
	 *
	 */

	private buildDependencyGraph(): RenderTask[] {

		const stack = new WeakSet<RenderTask>();
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

		return topologicalSort(dependencyGraph, true);

	}

	/**
	 * Updates the render pipeline.
	 *
	 * @throws If any task or resource connection is invalid.
	 * @return An executable render pipeline.
	 */

	update(): Task[] {

		// Graph
		//   ↓
		// collect resources/accesses
		//   ↓
		// resolve aliases
		//   ↓
		// validate resources
		//   ↓
		// derive dependencies
		//   ↓
		// topological sort
		//   ↓
		// analyze lifetimes
		//   ↓
		// assign physical targets
		//   ↓
		// execute

		const result = this.buildDependencyGraph();
		this.validate(result);
		this.resourceManager.update();

		return result;

	}

	/**
	 *
	 */

	updateResolution() {

	}

	/**
	 *
	 */

	getActiveGBufferComponents() {

		//const activeComponents = target.components;

		//const clearedComponents = Array.from(activeComponents)
		//	.filter(component => write.clearFlags?.gBuffer.has(component) ?? true);

		//const clearsDepth = write.clearFlags?.depth ?? true;
		//const clearsStencil = write.clearFlags?.stencil ?? true;

	}

	dispose(): void {

		this.resourceManager.dispose();

	}

}
