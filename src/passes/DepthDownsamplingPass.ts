import { FloatType, NearestFilter, WebGLRenderer, WebGLRenderTarget } from "three";
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
	 * Constructs a new depth downsampling pass.
	 */

	constructor() {

		super("DepthDownsamplingPass");

		this.fullscreenMaterial = new DepthDownsamplingMaterial();
		this.input.gBuffer.add(GBuffer.DEPTH);
		this.input.gBuffer.add(GBuffer.NORMAL);

		this.output.setBuffer(
			DepthDownsamplingPass.BUFFER_DEPTH,
			new WebGLRenderTarget(1, 1, {
				minFilter: NearestFilter,
				magFilter: NearestFilter,
				depthBuffer: false,
				type: FloatType
			})
		);

	}

	/**
	 * The depth render target.
	 */

	private get renderTarget(): WebGLRenderTarget {

		return this.output.getBuffer(DepthDownsamplingPass.BUFFER_DEPTH)!;

	}

	/**
	 * The output texture.
	 */

	get texture(): TextureResource {

		return this.output.buffers.get(DepthDownsamplingPass.BUFFER_DEPTH)!.texture;

	}

	protected override onInputChange(): void {

		this.fullscreenMaterial.depthBuffer = this.input.getBuffer(GBuffer.DEPTH);
		this.fullscreenMaterial.normalBuffer = this.input.getBuffer(GBuffer.NORMAL);
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

	override checkRequirements(renderer: WebGLRenderer): void {

		const gl = renderer.getContext();
		const renderable = gl.getExtension("EXT_color_buffer_float") ?? gl.getExtension("EXT_color_buffer_half_float");

		if(!renderable) {

			throw new Error("Rendering to a float texture is not supported");

		}

	}

	override render(): void {

		this.setRenderTarget(this.renderTarget);
		this.renderFullscreen();

	}

}
