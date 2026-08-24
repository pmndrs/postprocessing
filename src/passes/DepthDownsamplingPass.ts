import { FloatType, NearestFilter } from "three";
import { RenderTargetResource } from "../core/io/RenderTargetResource.js";
import { TextureResource } from "../core/io/TextureResource.js";
import { Pass } from "../core/Pass.js";
import { GBuffer } from "../enums/GBuffer.js";
import { DepthDownsamplingMaterial } from "../materials/DepthDownsamplingMaterial.js";

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
	 * The depth render target resource.
	 */

	private readonly buffer: RenderTargetResource;

	/**
	 * Constructs a new depth downsampling pass.
	 */

	constructor() {

		super("DepthDownsamplingPass");

		this.fullscreenMaterial = new DepthDownsamplingMaterial();
		this.requireTextures(GBuffer.DEPTH, GBuffer.NORMAL);

		this.buffer = this.setBuffer(DepthDownsamplingPass.BUFFER_DEPTH, {
			minFilter: NearestFilter,
			magFilter: NearestFilter,
			depthBuffer: false,
			type: FloatType
		});

	}

	/**
	 * The output texture.
	 */

	get texture(): TextureResource {

		return this.buffer.texture;

	}

	protected override onInputChange(): void {

		this.fullscreenMaterial.depthBuffer = this.input.buffers.get(GBuffer.DEPTH)?.value ?? null;
		this.fullscreenMaterial.normalBuffer = this.input.buffers.get(GBuffer.NORMAL)?.value ?? null;
		this.onResolutionChange();

	}

	protected override onResolutionChange(): void {

		// Use the resolution of the input buffer to calculate the depth/normal buffer texel size.
		const inputBuffer = this.input.defaultBuffer?.value ?? null;

		if(inputBuffer === null) {

			return;

		}

		const imgData = inputBuffer.source.data as ImageData;
		const { width, height } = imgData;
		this.fullscreenMaterial.setSize(width, height);

	}

	override checkRequirements(): void {

		if(this.renderer === null) {

			return;

		}

		const gl = this.renderer.getContext();
		const renderable = gl.getExtension("EXT_color_buffer_float") ?? gl.getExtension("EXT_color_buffer_half_float");

		if(renderable === null) {

			throw new Error("Rendering to a float texture is not supported");

		}

	}

	override render(): void {

		this.setRenderTarget(this.buffer.value);
		this.renderFullscreen();

	}

}
