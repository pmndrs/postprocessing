import { Material } from "three";
import { Pass } from "../Pass.js";
import { RenderPipeline } from "../RenderPipeline.js";
import { DisposableResource } from "./DisposableResource.js";
import { Resource } from "./Resource.js";

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

	private readonly pipelines: Set<RenderPipeline>;

	/**
	 * A set of resources that are currently being used in the render pipelines.
	 */

	private activeResources: Set<Resource>;

	/**
	 * Constructs a new resource manager.
	 */

	constructor(pipelines: Set<RenderPipeline>) {

		this.pipelines = pipelines;
		this.activeResources = new Set<Resource>();

	}

	/**
	 * Gathers all resources from all pipelines.
	 *
	 * @return The resources.
	 */

	private gatherResources(): Set<Resource> {

		const result = new Set<Resource>();

		for(const pipeline of this.pipelines) {

			for(const pass of pipeline.passes) {

				gatherResources(pass, result);

			}

		}

		return result;

	}

	/**
	 * Optimizes resources across all pipelines.
	 */

	optimize(): void {

		const resources = this.gatherResources();

		// Dispose orphaned resources.
		for(const resource of this.activeResources) {

			if(resource instanceof DisposableResource && !resources.has(resource)) {

				resource.dispose();

			}

		}

		this.activeResources = resources;

	}

}
