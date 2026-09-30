import { DepthTexture, SRGBColorSpace, WebGLRenderTarget } from "three";
import { Resource } from "./Resource.js";
import { Disposable, isDisposable } from "../Disposable.js";
import { RenderTask } from "../RenderTask.js";
import { RenderTargetResource } from "./RenderTargetResource.js";
import { GBuffer } from "../../enums/GBuffer.js";
import { FrameGraph } from "../FrameGraph.js";

/**
 * Gathers all resources from a given pass and its subpasses.
 *
 * @param task - The pass.
 * @param result - A set to store the resources in.
 */

function gatherResources(task: RenderTask, result: Set<Resource>): void {

	for(const input of task.in.buffers.values()) {

		result.add(input);

	}

	for(const output of task.out.buffers.values()) {

		result.add(output);

	}

	for(const subpass of task.subtasks) {

		gatherResources(subpass, result);

	}

}

/**
 * A resource manager that handles render target pooling and resource lifetimes.
 *
 * @category IO
 * @internal
 */

export class ResourceManager implements Disposable {

	/**
	 * The frame graph to compile.
	 */

	private readonly frameGraph: FrameGraph;

	/**
	 * A set of resources that are currently being used by the frame graph.
	 */

	private activeResources: Set<Resource>;

	/**
	 * Constructs a new resource manager.
	 *
	 * @param frameGraph - A frame graph.
	 */

	constructor(frameGraph: FrameGraph) {

		this.frameGraph = frameGraph;
		this.activeResources = new Set();

	}

	/**
	 * Updates the input and output resources of the frame graph.
	 *
	 * @param graph - The frame graph.
	 */

	update(graph: RenderTask[][]): void {

		// TODO
		// analyze lifetimes
		// assign physical targets

		this.disposeOrphanedResources(graph);

	}

	/**
	 *
	 */

	updateResolution() {

		// TODO update render target dimensions and recheck aliasing.

	}

	/**
	 * Disposes orphaned resources.
	 */

	disposeOrphanedResources(graph: RenderTask[][]): void {

		const resources = new Set<Resource>(); // TODO gather all resources from tasks... or is there a better way?

		for(const resource of this.activeResources) {

			if(isDisposable(resource) && !resources.has(resource)) {

				resource.dispose();

			}

		}

		this.activeResources = resources;

	}

	dispose(): void {

		for(const resource of this.activeResources) {

			if(isDisposable(resource)) {

				resource.dispose();

			}

		}

	}

}
