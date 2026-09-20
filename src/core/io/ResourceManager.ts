import { Material, WebGLRenderTarget } from "three";
import { Pass } from "../Pass.js";
import { FrameGraph } from "../FrameGraph.js";
import { Resource } from "./Resource.js";
import { Disposable, isDisposable } from "../Disposable.js";
import { RenderTargetDescriptor } from "../../utils/RenderTargetDescriptor.js";
import { RenderTask } from "../RenderTask.js";
import { RenderTargetResource } from "./RenderTargetResource.js";

/**
 * Gathers all resources from a given pass and its subpasses.
 *
 * @param pass - The pass.
 * @param result - A set to store the resources in.
 */

function gatherResources(pass: Pass<Material | null>, result: Set<Resource>): void {

	for(const input of pass.in.buffers.values()) {

		result.add(input);

	}

	for(const output of pass.out.buffers.values()) {

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
 * @internal
 */

export class ResourceManager implements Disposable {

	/**
	 * @see {@link autoSyncDefaultBuffers}
	 */

	private _autoSyncDefaultBuffers: boolean;

	/**
	 * @see {@link autoSRGB}
	 */

	private _autoSRGB: boolean;

	/**
	 * A set of resources that are currently being used by the frame graph.
	 */

	private activeResources: Set<Resource>;

	/**
	 * Constructs a new resource manager.
	 */

	constructor() {

		this._autoSyncDefaultBuffers = true;
		this._autoSRGB = true;
		this.activeResources = new Set();

	}

	/**
	 * Controls whether the settings of the input and output default buffers should be synchronized.
	 *
	 * @defaultValue true
	 */

	protected get autoSyncDefaultBuffers(): boolean {

		return this._autoSyncDefaultBuffers;

	}

	protected set autoSyncDefaultBuffers(value: boolean) {

		if(this._autoSyncDefaultBuffers === value) {

			return;

		}

		this._autoSyncDefaultBuffers = value;
		this.syncDefaultBuffers();

	}

	/**
	 * Controls automatic sRGB encoding for low precision output buffers.
	 *
	 * @defaultValue true
	 */

	protected get autoSRGB(): boolean {

		return this._autoSRGB;

	}

	protected set autoSRGB(value: boolean) {

		if(this._autoSRGB === value) {

			return;

		}

		this._autoSRGB = value;
		this.syncDefaultBuffers();

	}

	/**
	 * Gathers all resources.
	 *
	 * @return The resources.
	 */

	private gatherResources(): Set<Resource> {

		const result = new Set<Resource>();

		//	for(const task of this.frameGraph.tasks) {

		//		gatherResources(task, result);

		//	}

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
			const [name, values] = textureConfigs[i];
			texture.name = name;
			texture.setValues(values);

		}

		return renderTarget;

	}

	/**
	 * Synchronizes the texture settings of the input and output default buffers.
	 *
	 * This method ensures that the output buffer uses adequate settings for storing values from the input buffer.
	 */

	private syncDefaultBuffers(): void {

		//const renderer = this.renderer;
		//const inputBuffer = this.input.defaultBuffer?.value ?? null;
		//const outputBuffer = this.output.defaultBuffer?.value ?? null;

		//if(!this.autoSyncDefaultBuffers || renderer === null || inputBuffer === null || outputBuffer === null) {

		//	return;

		//}

		//const texture = outputBuffer.texture;

		//let textureNeedsUpdate = (
		//	texture.format !== inputBuffer.format ||
		//	texture.internalFormat !== inputBuffer.internalFormat ||
		//	texture.type !== inputBuffer.type
		//);

		//if(textureNeedsUpdate) {

		//	texture.format = inputBuffer.format;
		//	texture.internalFormat = inputBuffer.internalFormat;
		//	texture.type = inputBuffer.type;

		//}

		//// If the output buffer uses low precision, enable sRGB encoding to reduce information loss.
		//const useSRGB = (
		//	this.autoSRGB &&
		//	!this.output.frameBufferPrecisionHigh &&
		//	renderer.outputColorSpace === SRGBColorSpace
		//);

		//if(useSRGB && texture.colorSpace !== SRGBColorSpace) {

		//	texture.colorSpace = SRGBColorSpace;
		//	textureNeedsUpdate = true;

		//}

		//if(textureNeedsUpdate) {

		//	// Notify listeners.
		//	texture.needsUpdate = true;
		//	this.output.defaultBuffer!.texture.setChanged();

		//}

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

		this.optimize();

	}

	/**
	 * Optimizes resources.
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

	dispose(): void {

	}

}
