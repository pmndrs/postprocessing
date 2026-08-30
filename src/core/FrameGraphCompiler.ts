import { Disposable } from "./Disposable.js";
import { FrameGraph } from "./FrameGraph.js";
import { ResourceManager } from "./io/ResourceManager.js";
import { RenderTask } from "./RenderTask.js";
import { Task } from "./Task.js";

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
	 * A collection of render tasks and their depdendencies.
	 */

	private readonly taskDependencies: Map<RenderTask, RenderTask[]>;

	/**
	 * Constructs a new frame graph compiler.
	 *
	 * @param frameGraph - A frame graph.
	 */

	constructor(frameGraph: FrameGraph) {

		this.frameGraph = frameGraph;
		this.resourceManager = new ResourceManager(frameGraph);
		this.taskDependencies = new Map();

	}

	/**
	 * Validates the current frame graph tasks.
	 *
	 * - Verifies all required resource inputs are connected.
	 * - Verifies all consumed resources have producers.
	 * - Detects missing resources, invalid dependency chains and cycles.
	 */

	private validate(): void {



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

		this.validate();

		this.resourceManager.update();

		return [];

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
