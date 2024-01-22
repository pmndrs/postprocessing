import { Material, SRGBColorSpace, WebGLMultipleRenderTargets, WebGLRenderTarget } from "three";
import { GBuffer } from "../enums/GBuffer.js";
import { ClearPass } from "../passes/ClearPass.js";
import { GeometryPass } from "../passes/GeometryPass.js";
import { GBufferInfo } from "../utils/GBufferInfo.js";
import { Output } from "./Output.js";
import { Pass } from "./Pass.js";
import { RenderPipeline } from "./RenderPipeline.js";

/**
 * An I/O manager.
 *
 * @category Core
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

		IOManager.gatherGBufferComponents(pipeline);

		// Inputs depend on outputs.
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

		let previousPass = null;
		let previousOutputBuffer;

		for(let i = 0, j = -1, l = pipeline.passes.length; i < l; ++i, ++j) {

			const pass = pipeline.passes[i];

			if(geoPass !== undefined) {

				if(pass !== geoPass) {

					IOManager.assignGBufferTextures(pass, geoPass);

				}

				if(!(pass instanceof GeometryPass)) {

					pass.scene = geoPass.scene;
					pass.camera = geoPass.camera;

				}

			}

			if((j >= 0) && !(pipeline.passes[j] instanceof ClearPass)) {

				previousPass = pipeline.passes[j];

			}

			if(previousPass === null) {

				continue;

			}

			previousPass.output.defines.forEach((value, key) => pass.input.defines.set(key, value));
			previousPass.output.uniforms.forEach((value, key) => pass.input.uniforms.set(key, value));

			// Keep track of the last output buffer (some passes don't render anything).
			previousOutputBuffer = previousPass.output.buffers.get(Output.BUFFER_DEFAULT) ?? previousOutputBuffer;

			if(previousOutputBuffer === null) {

				pass.input.defaultBuffer = null;

			} else if(previousOutputBuffer instanceof WebGLMultipleRenderTargets) {

				const gBufferInfo = new GBufferInfo(previousOutputBuffer);

				if(gBufferInfo.indices.has(GBuffer.COLOR)) {

					const index = gBufferInfo.indices.get(GBuffer.COLOR) as number;
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

			if(j === l) {

				// This is the last pass.
				if(pipeline.autoRenderToScreen) {

					// Remember the original buffer and set the default buffer to null.
					outputDefaultBuffers.set(pass.output, pass.output.defaultBuffer);
					pass.output.defaultBuffer = null;

				}

			} else if(pass.output.defaultBuffer === null && outputDefaultBuffers.has(pass.output)) {

				// Restore the original buffer.
				pass.output.defaultBuffer = outputDefaultBuffers.get(pass.output)!;

			}

		}

		// Clear passes depend on the output of the next pass.
		for(let i = 0, j = 1, l = pipeline.passes.length; i < l; ++i, ++j) {

			const pass = pipeline.passes[i];

			if(j < l && pass instanceof ClearPass) {

				// Assign the output resources of the next pass to this clear pass.
				const nextPass = pipeline.passes[j];
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

		for(const pass of pipeline.passes) {

			for(const component of pass.input.gBuffer) {

				geoPass.gBufferComponents.add(component);

			}

		}

		// Check if there are secondary geometry passes.
		const geoPasses = pipeline.passes.filter((x) => x instanceof GeometryPass) as GeometryPass[];

		if(geoPasses.length > 1 && geoPass.gBufferComponents.has(GBuffer.COLOR)) {

			// Let the other passes render to another buffer with a single color attachment.
			for(let i = 1, l = geoPasses.length; i < l; ++i) {

				const pass = geoPasses[i];
				pass.gBufferComponents.add(GBuffer.COLOR);
				pass.gBufferComponents.add(GBuffer.DEPTH);

				// Secondary geometry passes need to copy depth from the main pass.
				pass.input.gBuffer.add(GBuffer.DEPTH);

			}

			geoPass.gBufferComponents.add(GBuffer.DEPTH);

		}

	}

	/**
	 * Assigns G-Buffer components to a given pass.
	 *
	 * @param pass - A pass.
	 * @param gBuffer - The G-Buffer.
	 * @param gBufferIndices - G-Buffer component indices.
	 */

	private static assignGBufferTextures(pass: Pass<Material | null>, geoPass?: GeometryPass): void {

		if(geoPass === undefined || geoPass.gBuffer === null) {

			return;

		}

		const gBufferInfo = new GBufferInfo(geoPass.gBuffer);

		for(const component of pass.input.gBuffer) {

			if(component === GBuffer.DEPTH) {

				pass.input.buffers.set(component, geoPass.gBuffer.depthTexture);

			} else if(gBufferInfo.indices.has(component)) {

				const index = gBufferInfo.indices.get(component) as number;
				pass.input.buffers.set(component, geoPass.gBuffer.texture[index]);

			}

		}

	}

}
