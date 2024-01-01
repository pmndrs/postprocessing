import { Material, SRGBColorSpace, WebGLMultipleRenderTargets, WebGLRenderTarget } from "three";
import { GBuffer } from "../enums/GBuffer.js";
import { ClearPass } from "../passes/ClearPass.js";
import { GeometryPass } from "../passes/GeometryPass.js";
import { RenderPipeline } from "./RenderPipeline.js";
import { Pass } from "./Pass.js";
import { Output } from "./Output.js";

/**
 * An I/O manager.
 *
 * @group Core
 */

export class IOManager {

	/**
	 * A collection of active render pipelines.
	 */

	private readonly pipelines: Set<RenderPipeline>;

	/**
	 * A collection of active render pipelines.
	 */

	private readonly outputDefaultBuffers: Map<Output, WebGLRenderTarget | WebGLMultipleRenderTargets | null>;

	/**
	 * Constructs a new I/O manager.
	 */

	constructor() {

		this.pipelines = new Set<RenderPipeline>();
		this.outputDefaultBuffers = new Map<Output, WebGLRenderTarget | WebGLMultipleRenderTargets | null>();

	}

	/**
	 * Updates the input and output buffers of all passes in a given pipeline.
	 *
	 * @param pipeline - The pipeline to update.
	 */

	private updatePipeline(pipeline: RenderPipeline): void {

		const geoPass = IOManager.findMainGeometryPass(pipeline);

		if(geoPass !== undefined) {

			IOManager.gatherGBufferComponents(geoPass, pipeline);

		}

		this.updateInput(pipeline, geoPass);
		this.updateOutput(pipeline);
		IOManager.syncDefaultBufferType(pipeline);

	}

	/**
	 * Updates the input buffers of all passes in a given pipeline.
	 *
	 * @param pipeline - The pipeline to update.
	 * @param geoPass - The main geometry pass.
	 */

	private updateInput(pipeline: RenderPipeline, geoPass?: GeometryPass): void {

		let previousOutputBuffer;

		for(let i = 0, j = -1, l = pipeline.passes.length; i < l; ++i, ++j) {

			const previousPass = (j >= 0) ? pipeline.passes[j] : null;
			const pass = pipeline.passes[i];

			if(pass !== geoPass && geoPass !== undefined) {

				IOManager.assignGBufferTextures(pass, geoPass);

				pass.scene = geoPass.scene;
				pass.camera = geoPass.camera;

			}

			if(previousPass === null || previousPass instanceof ClearPass) {

				continue;

			}

			previousPass.output.defines.forEach((value, key) => pass.input.defines.set(key, value));
			previousPass.output.uniforms.forEach((value, key) => pass.input.uniforms.set(key, value));

			// Keep track of the last output buffer (some passes don't render anything).
			previousOutputBuffer = previousPass.output.buffers.get(Output.BUFFER_DEFAULT) || previousOutputBuffer;

			if(previousOutputBuffer === null) {

				pass.input.defaultBuffer = null;

			} else if(previousOutputBuffer instanceof WebGLMultipleRenderTargets) {

				if(geoPass !== undefined && geoPass.gBufferIndices.has(GBuffer.COLOR)) {

					const index = geoPass.gBufferIndices.get(GBuffer.COLOR) as number;
					pass.input.defaultBuffer = previousOutputBuffer.texture[index];

				}

			} else if(previousOutputBuffer !== undefined) {

				pass.input.defaultBuffer = previousOutputBuffer.texture;

			}

		}

	}

	/**
	 * Updates the output buffers of all passes in a given pipeline.
	 *
	 * @param pipeline - The pipeline to update.
	 */

	private updateOutput(pipeline: RenderPipeline): void {

		const outputDefaultBuffers = this.outputDefaultBuffers;

		for(let i = 0, j = 1, l = pipeline.passes.length; i < l; ++i, ++j) {

			const pass = pipeline.passes[i];

			if(j < l && pass instanceof ClearPass) {

				// Assign the output resources of the next pass to this clear pass.
				const nextPass = pipeline.passes[j];
				nextPass.output.defines.forEach((value, key) => pass.output.defines.set(key, value));
				nextPass.output.uniforms.forEach((value, key) => pass.output.uniforms.set(key, value));
				pass.output.defaultBuffer = nextPass.output.defaultBuffer;

				continue;

			}

			// Assign output buffers.
			if(j === l) {

				// This is the last pass.
				if(pipeline.autoRenderToScreen) {

					// Remember the original buffer and set to null.
					outputDefaultBuffers.set(pass.output, pass.output.defaultBuffer);
					pass.output.defaultBuffer = null;

				}

			} else if(pass.output.defaultBuffer === null && outputDefaultBuffers.has(pass.output)) {

				// Restore the original buffer.
				pass.output.defaultBuffer = outputDefaultBuffers.get(pass.output)!;

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
		// Dispose related buffers.

	}

	/**
	 * Updates the input and output buffers of all pipelines.
	 */

	update(): void {

		for(const pipeline of this.pipelines) {

			this.updatePipeline(pipeline);

		}

	}

	/**
	 * Synchronizes the texture type of input/output default buffers.
	 *
	 * @param pipeline - The pipeline to update.
	 */

	private static syncDefaultBufferType(pipeline: RenderPipeline): void {

		for(const pass of pipeline.passes) {

			if(pass.input.defaultBuffer === null || pass.output.defaultBuffer === null ||
				pass.output.defaultBuffer instanceof WebGLMultipleRenderTargets) {

				continue;

			}

			pass.output.defaultBuffer.texture.type = pass.input.defaultBuffer.type;

			if(!pass.input.frameBufferPrecisionHigh && pipeline.renderer?.outputColorSpace === SRGBColorSpace) {

				// If the output buffer uses low precision, enable sRGB encoding to reduce information loss.
				pass.output.defaultBuffer.texture.colorSpace = SRGBColorSpace;

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

		return pipeline.passes.find((x) => x instanceof GeometryPass) as GeometryPass;

	}

	/**
	 * Collects all required GBuffer components for a given pipeline.
	 *
	 * @param geoPass - The primary geometry pass.
	 * @param pipeline - The pipeline.
	 */

	private static gatherGBufferComponents(geoPass: GeometryPass, pipeline: RenderPipeline): void {

		geoPass.gBufferComponents.clear();

		for(const pass of pipeline.passes) {

			for(const component of pass.input.gBuffer) {

				geoPass.gBufferComponents.add(component);

			}

		}

	}

	/**
	 * Assigns GBuffer components to a given pass.
	 *
	 * @param pass - A pass.
	 * @param gBuffer - The GBuffer.
	 * @param gBufferIndices - GBuffer component indices.
	 */

	private static assignGBufferTextures(pass: Pass<Material | null>, geoPass?: GeometryPass): void {

		if(geoPass === undefined || geoPass.gBuffer === null) {

			return;

		}

		for(const component of pass.input.gBuffer) {

			if(component === GBuffer.DEPTH) {

				pass.input.buffers.set(component, geoPass.gBuffer.depthTexture);

			} else if(geoPass.gBufferIndices.has(component)) {

				const index = geoPass.gBufferIndices.get(component) as number;
				pass.input.buffers.set(component, geoPass.gBuffer.texture[index]);

			}

		}

	}

}
