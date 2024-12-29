import { Material, SRGBColorSpace, WebGLRenderTarget } from "three";
import { GBuffer } from "../../enums/GBuffer.js";
import { ClearPass } from "../../passes/ClearPass.js";
import { extractIndices } from "../../utils/GBufferUtils.js";
import { GeometryPass } from "../../passes/GeometryPass.js";
import { Pass } from "../Pass.js";
import { RenderPipeline } from "../RenderPipeline.js";
import { TextureResource } from "./TextureResource.js";
import { Resource } from "./Resource.js";
import { Input } from "./Input.js";
import { RenderTargetResource } from "./RenderTargetResource.js";

/**
 * An I/O manager.
 *
 * @category IO
 */

export class IOManager {

	/**
	 * A collection of active render pipelines.
	 */

	private readonly pipelines: Set<RenderPipeline>;

	/**
	 * Keeps track of the original output default buffers.
	 *
	 * @see {@link RenderPipeline.autoRenderToScreen}
	 */

	private readonly outputDefaultBuffers: WeakMap<Resource, WebGLRenderTarget | null>;

	/**
	 * Indicates whether this manager is currently updating resources.
	 */

	private updating: boolean;

	/**
	 * Constructs a new I/O manager.
	 */

	constructor() {

		this.pipelines = new Set<RenderPipeline>();
		this.outputDefaultBuffers = new WeakMap<Resource, WebGLRenderTarget | null>();
		this.updating = false;

	}

	/**
	 * Updates the input and output resources of a given pipeline.
	 *
	 * @param pipeline - The pipeline to update.
	 */

	private updatePipeline(pipeline: RenderPipeline): void {

		IOManager.gatherGBufferComponents(pipeline);

		// Update outputs before inputs to reduce update events.
		this.updateOutput(pipeline);
		this.updateInput(pipeline);

		IOManager.syncDefaultBufferType(pipeline);

	}

	/**
	 * Updates the input buffers of all passes in a given pipeline.
	 *
	 * @param pipeline - The pipeline to update.
	 */

	private updateInput(pipeline: RenderPipeline): void {

		const geoPass = IOManager.findMainGeometryPass(pipeline);
		const passes = pipeline.passes.filter(x => x.enabled);

		// Assign scene, camera and G-Buffer textures.
		for(let i = 0, j = 1, l = passes.length; i < l; ++i, ++j) {

			const pass = passes[i];

			if(pass === geoPass) {

				continue;

			}

			if(j < l && pass instanceof ClearPass) {

				const nextPass = passes[j];
				pass.scene = nextPass.scene;
				pass.camera = nextPass.camera;

			} else if(!(pass instanceof GeometryPass) && geoPass !== undefined) {

				pass.scene = geoPass.scene;
				pass.camera = geoPass.camera;

			}

			IOManager.assignGBufferTextures(pass, geoPass);

		}

		let outputBuffer: RenderTargetResource | undefined;

		// Connect default buffers and assign inputs.
		for(let i = 0, j = 1, l = passes.length; j < l; ++i, ++j) {

			const pass = passes[i];
			const nextPass = passes[j];

			// Keep track of the last output buffer.
			if(!(pass instanceof ClearPass) && pass.output.hasDefaultBuffer &&
				pass.output.defaultBuffer!.value !== null) {

				outputBuffer = pass.output.defaultBuffer!;

			}

			// Use the outputs of this pass as inputs for the next pass.
			pass.output.defines.forEach((value, key) => nextPass.input.defines.set(key, value));
			pass.output.uniforms.forEach((value, key) => nextPass.input.uniforms.set(key, value));

			if(outputBuffer === undefined) {

				nextPass.input.buffers.delete(Input.BUFFER_DEFAULT);

			} else if(outputBuffer !== undefined) {

				// MRT: assuming texture 0 to be the main color attachment.
				nextPass.input.defaultBuffer = outputBuffer.texture;

			}

		}

	}

	/**
	 * Restores the original output buffers.
	 *
	 * @param passes - The passes to update.
	 */

	private restoreOutputBuffers(passes: Pass<Material | null>[]): void {

		const outputDefaultBuffers = this.outputDefaultBuffers;

		for(const pass of passes) {

			if(pass.output.defaultBuffer === null) {

				continue;

			}

			if(outputDefaultBuffers.has(pass.output.defaultBuffer)) {

				const originalBuffer = outputDefaultBuffers.get(pass.output.defaultBuffer)!;
				outputDefaultBuffers.delete(pass.output.defaultBuffer);
				pass.output.defaultBuffer = originalBuffer;

			}

		}

	}

	/**
	 * Updates the output buffers of all passes in a given pipeline.
	 *
	 * @param pipeline - The pipeline to update.
	 */

	private updateOutput(pipeline: RenderPipeline): void {

		const passes = pipeline.passes.filter(x => x.enabled);

		// Auto render to screen.
		if(pipeline.autoRenderToScreen && passes.length > 0) {

			this.restoreOutputBuffers(passes);

			const outputDefaultBuffers = this.outputDefaultBuffers;
			const lastPass = passes[passes.length - 1];

			if(lastPass.output.defaultBuffer !== null) {

				// Remember the original buffer and set the default buffer to null.
				outputDefaultBuffers.set(lastPass.output.defaultBuffer, lastPass.output.defaultBuffer.value);
				lastPass.output.defaultBuffer = null;

			}

		}

		// Connect clear passes with subsequent passes.
		for(let i = 0, j = 1, l = passes.length; j < l; ++i, ++j) {

			const pass = passes[i];

			if(pass instanceof ClearPass) {

				// Assign the output resources of the next pass to this clear pass.
				const nextPass = passes[j];
				nextPass.output.defines.forEach((value, key) => pass.output.defines.set(key, value));
				nextPass.output.uniforms.forEach((value, key) => pass.output.uniforms.set(key, value));
				pass.output.defaultBuffer = nextPass.output.defaultBuffer;

			}

		}

	}

	/**
	 * Adds a render pipeline.
	 *
	 * @param pipeline - The pipeline to add.
	 */

	addPipeline(pipeline: RenderPipeline): void {

		this.pipelines.add(pipeline);

	}

	/**
	 * Removes a render pipeline.
	 *
	 * @param pipeline - The pipeline to remove.
	 */

	removePipeline(pipeline: RenderPipeline): void {

		this.pipelines.delete(pipeline);

	}

	/**
	 * Updates the input and output resources of all pipelines.
	 */

	update(): void {

		if(this.updating) {

			return;

		}

		this.updating = true;

		for(const pipeline of this.pipelines) {

			this.updatePipeline(pipeline);

		}

		this.updating = false;

	}

	/**
	 * Synchronizes the texture type of input/output default buffers.
	 *
	 * @param pipeline - The pipeline to update.
	 */

	private static syncDefaultBufferType(pipeline: RenderPipeline): void {

		for(const pass of pipeline.passes.filter(x => x.enabled)) {

			const inputBuffer = pass.input.defaultBuffer?.value ?? null;
			const outputBuffer = pass.output.defaultBuffer?.value ?? null;

			if(inputBuffer === null || outputBuffer === null || pass instanceof GeometryPass) {

				continue;

			}

			outputBuffer.texture.type = inputBuffer.type;

			if(!pass.input.frameBufferPrecisionHigh && pipeline.renderer?.outputColorSpace === SRGBColorSpace) {

				// If the output buffer uses low precision, enable sRGB encoding to reduce information loss.
				outputBuffer.texture.colorSpace = SRGBColorSpace;

			}

		}

	}

	/**
	 * Returns the main geometry pass of the given pipeline.
	 *
	 * @param pipeline - A pipeline.
	 * @return The geometry pass, or undefined if there is none.
	 */

	private static findMainGeometryPass(pipeline: RenderPipeline): GeometryPass | undefined {

		return pipeline.passes.find((x) => x.enabled && x instanceof GeometryPass) as GeometryPass;

	}

	/**
	 * Collects all required G-Buffer components for a given pipeline.
	 *
	 * @param pipeline - The pipeline.
	 */

	private static gatherGBufferComponents(pipeline: RenderPipeline): void {

		const geoPass = IOManager.findMainGeometryPass(pipeline);

		if(geoPass === undefined) {

			return;

		}

		geoPass.gBufferComponents.clear();

		for(const pass of pipeline.passes.filter(x => x.enabled)) {

			for(const component of pass.input.gBuffer) {

				geoPass.gBufferComponents.add(component);

			}

		}

		// Check if there are secondary geometry passes.
		const geoPasses = pipeline.passes.filter((x) => x.enabled && x instanceof GeometryPass) as GeometryPass[];

		if(geoPasses.length <= 1 || !geoPass.gBufferComponents.has(GBuffer.COLOR)) {

			return;

		}

		// Let the other passes render to another buffer with a single color attachment.
		for(let i = 1, l = geoPasses.length; i < l; ++i) {

			const pass = geoPasses[i];
			pass.gBufferComponents.add(GBuffer.COLOR);

			// Secondary geometry passes may need to copy depth from the main pass.
			if(pass.depthBuffer) {

				pass.gBufferComponents.add(GBuffer.DEPTH);
				pass.input.gBuffer.add(GBuffer.DEPTH);
				geoPass.gBufferComponents.add(GBuffer.DEPTH);

			}

		}

	}

	/**
	 * Assigns G-Buffer components to a given pass.
	 *
	 * @param pass - A pass.
	 * @param geoPass - The main geometry pass.
	 */

	private static assignGBufferTextures(pass: Pass<Material | null>, geoPass?: GeometryPass): void {

		if(geoPass === undefined || geoPass.gBuffer === null) {

			return;

		}

		pass.input.gBufferConfig = geoPass.gBufferConfig;
		const indices = extractIndices(geoPass.gBuffer);

		for(const component of pass.input.gBuffer) {

			if(component === GBuffer.DEPTH as string) {

				pass.input.buffers.set(component, new TextureResource(geoPass.gBuffer.depthTexture));

			} else if(indices.has(component)) {

				const index = indices.get(component)!;
				pass.input.buffers.set(component, new TextureResource(geoPass.gBuffer.textures[index]));

			}

		}

	}

}
