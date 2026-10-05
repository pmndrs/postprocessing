import { topologicalSortGrouped } from "../utils/functions/sorting.js";
import { Disposable } from "./Disposable.js";
import { FrameGraph } from "./FrameGraph.js";
import { Output } from "./io/Output.js";
import { RenderTargetResource } from "./io/RenderTargetResource.js";
import { TextureResource } from "./io/TextureResource.js";
import { RenderTask } from "./RenderTask.js";
import { Task } from "./Task.js";

/**
 * Recursively collects active input textures from a given task and its subtasks.
 *
 * @remarks Textures are considered active when they are connected __and__ required.
 * @param task - The task to collect textures from.
 * @param textures - A collection to store the textures in.
 */

function collectInputTextures(task: RenderTask, textures: Set<TextureResource>): void {

	for(const requiredTexture of task.requiredTextures) {

		const texture = task.in.textures.get(requiredTexture);

		if(texture !== undefined) {

			textures.add(texture);

		}

	}

	for(const subtask of task.subtasks) {

		collectInputTextures(subtask, textures);

	}

}

/**
 * Retrieves all textures used by the given task and its subtasks.
 *
 * @param texturesByTask - Texture collections organized by tasks.
 * @param task - A task.
 * @return The textures.
 */

function texturesOf(texturesByTask: Map<RenderTask, Set<TextureResource>>, task: RenderTask): Set<TextureResource> {

	let textures = texturesByTask.get(task);

	if(textures === undefined) {

		textures = new Set<TextureResource>();
		collectInputTextures(task, textures);
		texturesByTask.set(task, textures);

	}

	return textures;

}

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
 * Recursively builds a dependency graph based on task input resources.
 *
 * @param task - The current task node.
 * @param producers - A collection that maps Output instances to active tasks.
 * @param texturesByTask - A collection to store the input textures of visited tasks in.
 * @param visiting - Keeps track of tasks that are currently being visited to detect cycles.
 * @param graph - The resulting graph.
 */

function buildDependencyGraph(task: RenderTask, producers: Map<Output, RenderTask>,
	texturesByTask: Map<RenderTask, Set<TextureResource>>, visiting: Set<RenderTask>,
	graph: Map<RenderTask, Set<RenderTask>>): void {

	if(visiting.has(task)) {

		// Cycle.
		return;

	}

	visiting.add(task);

	const textures = texturesOf(texturesByTask, task);
	const dependencies = dependenciesOf(graph, task);

	// Reads: resource → owner → producer.
	for(const texture of textures) {

		if(texture.owner === null) {

			// External source, no producer.
			continue;

		}

		const producer = producers.get(texture.owner);

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

		const producer = producers.get(connection.resource.owner);

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
				buildDependencyGraph(producer, producers, texturesByTask, visiting, graph);
				break;

			}

		}

	}

	for(const dependency of dependencies) {

		buildDependencyGraph(dependency, producers, texturesByTask, visiting, graph);

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
	 * A collection of active render tasks and their dependencies.
	 */

	private readonly dependencyGraph: Map<RenderTask, Set<RenderTask>>;

	/**
	 * A collection of outputs and their associated tasks.
	 *
	 * @remarks This collection only includes enabled tasks.
	 */

	private readonly tasksByOutput: Map<Output, RenderTask>;

	/**
	 * A collection of tasks and their active input textures.
	 *
	 * @remarks The texture sets include the textures of each respective task's subtasks.
	 */

	private readonly texturesByTask: Map<RenderTask, Set<TextureResource>>;

	/**
	 * A set of render target resources that are currently being used by the frame graph.
	 */

	private activeRenderTargetResources: Set<RenderTargetResource>;

	/**
	 * The current render pipeline.
	 */

	private renderPipeline: RenderTask[][];

	/**
	 * Constructs a new frame graph compiler.
	 *
	 * @param frameGraph - A frame graph.
	 */

	constructor(frameGraph: FrameGraph) {

		this.frameGraph = frameGraph;
		this.dependencyGraph = new Map();
		this.tasksByOutput = new Map();
		this.texturesByTask = new Map();
		this.activeRenderTargetResources = new Set();
		this.renderPipeline = [];

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
	 * Validates the given render pipeline.
	 *
	 * - Verifies all required resource inputs are connected.
	 * - Verifies all consumed resources have producers.
	 * - Detects missing resources, invalid dependency chains and cycles.
	 *
	 * @throws If the validation fails.
	 */

	private validate(): void {

		for(const executionLevel of this.renderPipeline) {

			for(const task of executionLevel) {

				this.validateTask(task);

				for(const subtask of task.subtasks) {

					this.validateTask(subtask);

				}

			}

		}

	}

	/**
	 * Builds an executable dependency graph based on the current {@link frameGraph}.
	 *
	 * @return The dependency graph, grouped and sorted by execution order, ASC.
	 */

	private buildDependencyGraph(): RenderTask[][] {

		const stack = new Set<RenderTask>();
		const dependencyGraph = this.dependencyGraph;
		const texturesByTask = this.texturesByTask;
		const tasksByOutput = this.tasksByOutput;

		dependencyGraph.clear();
		texturesByTask.clear();
		tasksByOutput.clear();

		for(const task of Array.from(this.frameGraph.tasks).filter(x => x.enabled)) {

			tasksByOutput.set(task.out, task);

		}

		for(const root of Array.from(this.frameGraph.roots).filter(x => x.enabled)) {

			buildDependencyGraph(root, tasksByOutput, texturesByTask, stack, dependencyGraph);

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

		this.renderPipeline = this.buildDependencyGraph();
		this.validate();

		// TODO
		// analyze lifetimes
		// assign physical targets

		this.updateResolution();
		this.disposeOrphanedRenderTargetResources();

		return this.renderPipeline;

	}

	/**
	 * Updates the resolution of the active RenderTargetResources.
	 */

	updateResolution() {

	}

	/**
	 * Disposes orphaned resources.
	 */

	disposeOrphanedRenderTargetResources(): void {

		const activeRenderTargetResources = new Set<RenderTargetResource>();

		// Flatten active render target resources into one set.
		for(const executionLevel of this.renderPipeline) {

			for(const task of executionLevel) {

				for(const resource of task.out.buffers.values()) {

					activeRenderTargetResources.add(resource);

				}

			}

		}

		// Identify render targets that are no longer active and dispose them.
		for(const resource of this.activeRenderTargetResources) {

			if(!activeRenderTargetResources.has(resource)) {

				resource.dispose();

			}

		}

		this.activeRenderTargetResources = activeRenderTargetResources;

	}

	dispose(): void {

		for(const resource of this.activeRenderTargetResources) {

			resource.dispose();

		}

	}

}
