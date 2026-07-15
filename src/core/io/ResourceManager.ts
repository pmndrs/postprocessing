import { Material, WebGLRenderTarget } from "three";
import { Pass } from "../Pass.js";
import { FrameGraph } from "../FrameGraph.js";
import { Resource } from "./Resource.js";
import { isDisposable } from "../Disposable.js";
import { RenderTargetResource } from "./RenderTargetResource.js";
import { RenderTargetDescriptor } from "../../utils/RenderTargetDescriptor.js";

/**
 * Gathers all resources from a given pass and its subpasses.
 *
 * @param pass - The pass.
 * @param result - A set to store the resources in.
 */

function gatherResources(pass: Pass<Material | null>, result: Set<Resource>): void {

	for(const input of pass.input.buffers.values()) {

		result.add(input);

	}

	for(const output of pass.output.buffers.values()) {

		result.add(output);

	}

	for(const subpass of pass.subpasses) {

		gatherResources(subpass, result);

	}

}

/**
 * A resource manager.
 *
 * @category IO
 */

export class ResourceManager {

	/**
	 * A collection of active render pipelines.
	 */

	private readonly frameGraphs: Set<FrameGraph>;

	/**
	 * A set of resources that are currently being used in frame graphs.
	 */

	private activeResources: Set<Resource>;

	/**
	 * Indicates whether this manager is currently updating resources.
	 */

	private updating: boolean;

	/**
	 * Constructs a new resource manager.
	 */

	constructor() {

		this.frameGraphs = new Set();
		this.activeResources = new Set();
		this.updating = false;

	}

	/**
	 * Gathers all resources from all pipelines.
	 *
	 * @return The resources.
	 */

	private gatherResources(): Set<Resource> {

		const result = new Set<Resource>();

		//for(const graph of this.graphs) {

		//	for(const pass of graph.passes) {

		//		gatherResources(pass, result);

		//	}

		//}

		return result;

	}

	/**
	 * Creates a new render target based on the given descriptor.
	 *
	 * @param descriptor - A render target descriptor.
	 * @return The new render target.
	 */

	private createRenderTarget(descriptor: RenderTargetDescriptor): WebGLRenderTarget {

		const renderTarget = new WebGLRenderTarget(1, 1, descriptor);
		const textureConfigs = Array.from(descriptor.textures.entries());

		for(let i = 0, l = textureConfigs.length; i < l; ++i) {

			const texture = renderTarget.textures[i];
			const textureConfig = textureConfigs[i];
			texture.name = textureConfig[0];
			texture.setValues(textureConfig[1]);

		}

		return renderTarget;

	}

	/**
	 * Adds a frame graph.
	 *
	 * @param graph - The graph to add.
	 */

	addFrameGraph(graph: FrameGraph): void {

		this.frameGraphs.add(graph);

	}

	/**
	 * Removes a frame graph.
	 *
	 * @param graph - The graph to remove.
	 */

	removeFrameGraph(graph: FrameGraph): void {

		this.frameGraphs.delete(graph);

	}

	/**
	 * Updates the input and output resources of all graphs.
	 */

	update(): void {

		if(this.updating) {

			return;

		}

		this.updating = true;

		for(const graph of this.frameGraphs) {

			this.updateFrameGraph(graph);

		}

		this.optimize();
		this.updating = false;

	}

	/**
	 * Updates the input and output resources of a given graph.
	 *
	 * @param graph - The graph to update.
	 */

	private updateFrameGraph(graph: FrameGraph): void {

	}

	/**
	 * Optimizes resources across all pipelines.
	 */

	optimize(): void {

		const resources = this.gatherResources();

		// Dispose orphaned resources.
		for(const resource of this.activeResources) {

			if(isDisposable(resource) && !resources.has(resource)) {

				resource.dispose();

			}

		}

		this.activeResources = resources;

	}

}
