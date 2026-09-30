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
	 * Creates a new render target based on the given descriptor.
	 *
	 * @param resource - A render target resource.
	 * @param activeTextures - Texture attachments that have active consumers.
	 * @return The new render target.
	 */

	private createRenderTarget(resource: RenderTargetResource, activeTextures: string[]): WebGLRenderTarget {

		const descriptor = resource.descriptor;
		const renderTarget = new WebGLRenderTarget(1, 1, descriptor.options);

		// Get the templates for the required textures (depth is handled separately).
		const textureTemplates = resource.descriptor.textures
			.filter(x => activeTextures.includes(x.name) && x.name !== GBuffer.DEPTH as string);

		for(let i = 0, l = textureTemplates.length; i < l; ++i) {

			const texture = renderTarget.textures[i];
			const textureTemplate = textureTemplates[i];
			texture.name = textureTemplate.name;
			texture.setValues(textureTemplate);

		}

		// If the output buffer uses low precision, enable sRGB encoding to reduce information loss.
		const useSRGB = (
			resource.autoSRGB &&
			!resource.frameBufferPrecisionHigh // && this.renderer.outputColorSpace === SRGBColorSpace
		);

		if(useSRGB && renderTarget.texture.colorSpace !== SRGBColorSpace) {

			renderTarget.texture.colorSpace = SRGBColorSpace;

		}

		const depthTexture = descriptor.options.depthTexture ?? null;

		if(depthTexture !== null) {

			// Depth texture override.
			renderTarget.depthTexture = depthTexture;

		} else {

			const depthTextureTemplate = descriptor.textures.find(x => x.name !== GBuffer.DEPTH as string);

			if(depthTextureTemplate === undefined || !activeTextures.includes(GBuffer.DEPTH)) {

				renderTarget.depthTexture = null;

			} else {

				const texture = new DepthTexture();
				texture.name = depthTextureTemplate.name;
				texture.setValues(depthTextureTemplate);
				renderTarget.depthTexture = texture;

			}

		}

		return renderTarget;

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

		this.optimize(graph);

	}

	/**
	 * Optimizes resources.
	 */

	optimize(graph: RenderTask[][]): void {

		const resources = new Set<Resource>();
		// TODO gather resources?

		// Dispose orphaned resources.
		for(const resource of this.activeResources) {

			if(isDisposable(resource) && !resources.has(resource)) {

				resource.dispose();

			}

		}

		this.activeResources = resources;

	}

	dispose(): void {

	}

}
