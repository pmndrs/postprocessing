import { Disposable } from "./Disposable.js";
import { FrameGraph } from "./FrameGraph.js";
import { ResourceManager } from "./io/ResourceManager.js";
import { RenderTask } from "./RenderTask.js";

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
	 */

	constructor(frameGraph: FrameGraph) {

		this.frameGraph = frameGraph;
		this.resourceManager = new ResourceManager(frameGraph);
		this.taskDependencies = new Map();

	}

	update() {

		this.resourceManager.update();

	}

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
