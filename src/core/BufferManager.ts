import { Material, SRGBColorSpace, WebGLMultipleRenderTargets } from "three";
import { GBuffer } from "../enums/GBuffer.js";
import { GeometryPass } from "../passes/GeometryPass.js";
import { RenderPipeline } from "./RenderPipeline.js";
import { Pass } from "./Pass.js";

/**
 * A buffer manager.
 *
 * @group Core
 */

export class BufferManager {

	/**
	 * A collection of active render pipelines.
	 */

	private readonly pipelines: Set<RenderPipeline>;

	/**
	 * Constructs a new buffer manager.
	 */

	constructor() {

		this.pipelines = new Set<RenderPipeline>();

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
	 * Collects all required GBuffer components for a given pipeline.
	 *
	 * @param geoPass - The primary geometry pass.
	 * @param pipeline - The pipeline.
	 */

	private gatherGBufferComponents(geoPass: GeometryPass, pipeline: RenderPipeline): void {

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

	private assignGBufferTextures(pass: Pass<Material | null>, geoPass?: GeometryPass): void {

		if(geoPass === undefined) {

			return;

		}

		for(const component of pass.input.gBuffer) {

			if(geoPass.gBufferIndices.has(component) && geoPass.gBuffer !== null) {

				const index = geoPass.gBufferIndices.get(component) as number;
				pass.input.buffers.set(component, geoPass.gBuffer.texture[index]);

			}

		}

	}

	/**
	 * Updates the input buffers of all passes in a given pipeline.
	 *
	 * @param pipeline - The pipeline to update.
	 * @param geoPass - The main geometry pass.
	 */

	private updateInput(pipeline: RenderPipeline, geoPass?: GeometryPass): void {

		for(let i = 0, l = pipeline.passes.length; i < l; ++i) {

			const previousPass = (i > 0) ? pipeline.passes[i - 1] : null;
			const pass = pipeline.passes[i];

			if(pass === geoPass) {

				continue;

			}

			this.assignGBufferTextures(pass, geoPass);

			if(previousPass === null) {

				continue;

			}

			for(const entry of previousPass.output.defines) {

				pass.input.defines.set(entry[0], entry[1]);

			}

			for(const entry of previousPass.output.uniforms) {

				pass.input.uniforms.set(entry[0], entry[1]);

			}

			const buffer = previousPass.output.defaultBuffer;

			if(buffer === null) {

				pass.input.defaultBuffer = null;

			} else if(buffer instanceof WebGLMultipleRenderTargets) {

				if(geoPass !== undefined && geoPass.gBufferIndices.has(GBuffer.COLOR)) {

					const index = geoPass.gBufferIndices.get(GBuffer.COLOR) as number;
					pass.input.defaultBuffer = buffer.texture[index];

				}

			} else {

				pass.input.defaultBuffer = buffer.texture;

			}

		}

	}

	/**
	 * Updates the output buffers of all passes in a given pipeline.
	 *
	 * @param pipeline - The pipeline to update.
	 */

	private updateOutput(pipeline: RenderPipeline): void {

		for(const pass of pipeline.passes) {

			const { input, output } = pass;

			if(input.defaultBuffer === null || output.defaultBuffer === null ||
				output.defaultBuffer instanceof WebGLMultipleRenderTargets) {

				continue;

			}

			output.defaultBuffer.texture.type = input.defaultBuffer.type;

			if(!input.frameBufferPrecisionHigh && pipeline.renderer?.outputColorSpace === SRGBColorSpace) {

				output.defaultBuffer.texture.colorSpace = SRGBColorSpace;

			}

		}

	}

	/**
	 * Updates the input and output buffers of all passes in a given pipeline.
	 *
	 * @param pipeline - The pipeline to update.
	 */

	private updatePipeline(pipeline: RenderPipeline): void {

		const geoPass = BufferManager.findMainGeometryPass(pipeline);

		if(geoPass !== undefined) {

			this.gatherGBufferComponents(geoPass, pipeline);

		}

		this.updateInput(pipeline, geoPass);
		this.updateOutput(pipeline);

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
	 * Returns the main geometry pass of the given pipeline.
	 *
	 * @param pipeline - A pipeline.
	 * @return The geometry pass, or undefined if there is none.
	 */

	private static findMainGeometryPass(pipeline: RenderPipeline): GeometryPass | undefined {

		return pipeline.passes.find((x) => x instanceof GeometryPass) as GeometryPass;

	}

}
