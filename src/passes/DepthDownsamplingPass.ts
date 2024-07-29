import { FloatType, NearestFilter, Texture, WebGLRenderer, WebGLRenderTarget } from "three";
import { Pass } from "../core/Pass.js";
import { GBuffer } from "../enums/GBuffer.js";
import { DepthDownsamplingMaterial } from "../materials/DepthDownsamplingMaterial.js";
import { Resolution } from "../utils/Resolution.js";

/**
 * A downsampling pass that picks the most representative depth (and normal) in 2x2 texel neighborhoods.
 *
 * @category Passes
 */

export class DepthDownsamplingPass extends Pass<DepthDownsamplingMaterial> {

	/**
	 * Identifies the depth output buffer.
	 */

	private static readonly BUFFER_DEPTH = "BUFFER_DEPTH";

	/**
	 * Constructs a new depth downsampling pass.
	 */

	constructor() {

		super("DepthDownsamplingPass");

		this.fullscreenMaterial = new DepthDownsamplingMaterial();
		this.input.gBuffer.add(GBuffer.DEPTH);
		this.input.gBuffer.add(GBuffer.NORMAL);

		this.renderTarget = new WebGLRenderTarget(1, 1, {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			depthBuffer: false,
			type: FloatType
		});

	}

	/**
	 * The depth render target.
	 */

	private get renderTarget(): WebGLRenderTarget {

		return this.output.getBuffer(DepthDownsamplingPass.BUFFER_DEPTH)!;

	}

	private set renderTarget(value: WebGLRenderTarget) {

		this.output.setBuffer(DepthDownsamplingPass.BUFFER_DEPTH, value);

	}

	/**
	 * The output texture.
	 */

	get texture(): Texture {

		return this.renderTarget.texture;

	}

	protected override onInputChange(): void {

		this.fullscreenMaterial.depthBuffer = this.input.getBuffer(GBuffer.DEPTH);
		this.fullscreenMaterial.normalBuffer = this.input.getBuffer(GBuffer.NORMAL);

	}

	protected override onResolutionChange(resolution: Resolution): void {

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
