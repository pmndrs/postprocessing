import { SRGBColorSpace, WebGLMultipleRenderTargets } from "three";
import { GBuffer } from "../enums/GBuffer.js";
import { GeometryPass } from "../passes/GeometryPass.js";
import { Disposable } from "./Disposable.js";
import { RenderPipeline } from "./RenderPipeline.js";

/**
 * A buffer manager.
 *
 * @group Core
 */

export class BufferManager implements Disposable {

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

	}

	/**
	 * Collects all required GBuffer components for a given pipeline.
	 *
	 * @param geoPass - The primary geometry pass.
	 * @param pipeline - The pipeline.
	 */

	private gatherGBufferComponents(geoPass: GeometryPass, pipeline: RenderPipeline): void {

		geoPass.gBufferComponents.clear();
		geoPass.gBufferComponents.add(GBuffer.COLOR);

		for(const pass of pipeline.passes) {

			for(const component of pass.input.gBuffer) {

				geoPass.gBufferComponents.add(component);

			}

		}

	}

	/**
	 * Updates the input and output buffers of all passes in a given pipeline.
	 *
	 * @param pipeline - The pipeline to update.
	 */

	private updatePipeline(pipeline: RenderPipeline): void {

		const mainGeoPass = pipeline.passes.find((x) => x instanceof GeometryPass) as GeometryPass;
		const gBufferIndices = mainGeoPass.output.defines as Map<GBuffer, number>;

		let gBuffer = null;

		if(mainGeoPass !== undefined) {

			this.gatherGBufferComponents(mainGeoPass, pipeline);
			gBuffer = mainGeoPass.output.defaultBuffer as WebGLMultipleRenderTargets;

		}

		for(let i = 0, l = pipeline.passes.length; i < l; ++i) {

			const previousPass = (i > 0) ? pipeline.passes[i - 1] : null;
			const pass = pipeline.passes[i];

			if(pass === mainGeoPass) {

				continue;

			}

			if(pass instanceof GeometryPass) {

				for(const component of mainGeoPass.gBufferComponents) {

					pass.gBufferComponents.add(component);

				}

				pass.output.defaultBuffer = mainGeoPass.output.defaultBuffer;
				continue;

			}

			if(gBuffer !== null) {

				for(const component of pass.input.gBuffer) {

					if(gBufferIndices.has(component)) {

						pass.input.buffers.set(component, gBuffer.texture[gBufferIndices.get(component) as number]);

					}

				}

			}

			if(previousPass !== null) {

				const buffer = previousPass.output.defaultBuffer;

				if(buffer === null) {

					pass.input.defaultBuffer = null;

				} else if(buffer instanceof WebGLMultipleRenderTargets) {

					if(gBufferIndices.has(GBuffer.COLOR)) {

						pass.input.defaultBuffer = buffer.texture[gBufferIndices.get(GBuffer.COLOR) as number];

					}

				} else {

					pass.input.defaultBuffer = buffer.texture;

				}

			}

		}

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
	 * Updates the input and output buffers of all pipelines.
	 */

	update(): void {

		for(const pipeline of this.pipelines) {

			this.updatePipeline(pipeline);

		}

	}

	dispose(): void {

	}

}
