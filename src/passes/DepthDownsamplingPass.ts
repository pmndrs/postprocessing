import { FloatType, NearestFilter, Texture, WebGLRenderer, WebGLRenderTarget } from "three";
import { Pass } from "../core/Pass.js";
import { GBuffer } from "../enums/GBuffer.js";
import { DepthDownsamplingMaterial } from "../materials/DepthDownsamplingMaterial.js";
import { Resolution } from "../utils/Resolution.js";

/**
 * A downsampling pass that picks the most representative depth (and normal) in 2x2 texel neighborhoods.
 *
 * @group Passes
 */

export class DepthDownsamplingPass extends Pass<DepthDownsamplingMaterial> {

	/**
	 * Constructs a new depth downsampling pass.
	 */

	constructor() {

		super("DepthDownsamplingPass");

		this.fullscreenMaterial = new DepthDownsamplingMaterial();
		this.input.gBuffer.add(GBuffer.DEPTH);
		this.input.gBuffer.add(GBuffer.NORMAL);

		const renderTarget = new WebGLRenderTarget(1, 1, {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			depthBuffer: false,
			type: FloatType
		});

		this.output.defaultBuffer = renderTarget;

	}

	/**
	 * Alias for {@link output.defaultBuffer}.
	 */

	get renderTarget(): WebGLRenderTarget {

		return this.output.defaultBuffer as WebGLRenderTarget;

	}

	protected override onInputChange(): void {

		this.fullscreenMaterial.depthBuffer = this.input.buffers.get(GBuffer.DEPTH) as Texture;
		this.fullscreenMaterial.normalBuffer = this.input.buffers.get(GBuffer.NORMAL) as Texture;

	}

	protected override onResolutionChange(resolution: Resolution): void {

		this.renderTarget.setSize(resolution.width, resolution.height);

		// Use the full resolution to calculate the depth/normal buffer texel size.
		this.fullscreenMaterial.setSize(resolution.baseWidth, resolution.baseHeight);

	}

	override checkRequirements(renderer: WebGLRenderer): void {

		const gl = renderer.getContext();
		const renderable = gl.getExtension("EXT_color_buffer_float") || gl.getExtension("EXT_color_buffer_half_float");

		if(!renderable) {

			throw new Error("Rendering to a float texture is not supported");

		}

	}

	render(): void {

		this.renderer?.setRenderTarget(this.renderTarget);
		this.renderFullscreen();

	}

}
