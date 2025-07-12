import { WebGLRenderTarget } from "three";
import { TextureResource } from "../core/io/TextureResource.js";
import { Pass } from "../core/Pass.js";
import { LuminanceHighPassMaterial } from "../materials/LuminanceHighPassMaterial.js";

/**
 * A luminance pass.
 *
 * @category Passes
 */

export class LuminancePass extends Pass<LuminanceHighPassMaterial> {

	/**
	 * Identifies the luminance output buffer.
	 */

	private static readonly BUFFER_LUMINANCE = "BUFFER_LUMINANCE";

	/**
	 * Constructs a new luminance pass.
	 */

	constructor() {

		super("LuminancePass");

		this.output.setBuffer(LuminancePass.BUFFER_LUMINANCE, this.createFramebuffer());
		this.fullscreenMaterial = new LuminanceHighPassMaterial();

	}

	/**
	 * The luminance render target.
	 */

	private get renderTarget(): WebGLRenderTarget {

		return this.output.getBuffer(LuminancePass.BUFFER_LUMINANCE)!;

	}

	/**
	 * The output texture.
	 */

	get texture(): TextureResource {

		return this.output.buffers.get(LuminancePass.BUFFER_LUMINANCE)!.texture;

	}

	protected override onInputChange(): void {

		// The output buffer settings depend on the input buffer.
		const inputTexture = this.input.defaultBuffer?.value ?? null;

		if(inputTexture === null) {

			return;

		}

		const texture = this.renderTarget.texture;
		texture.format = inputTexture.format;
		texture.internalFormat = inputTexture.internalFormat;
		texture.type = inputTexture.type;
		texture.colorSpace = inputTexture.colorSpace;
		texture.needsUpdate = true;

		if(this.input.frameBufferPrecisionHigh) {

			this.fullscreenMaterial.outputPrecision = "mediump";

		} else {

			this.fullscreenMaterial.outputPrecision = "lowp";

		}

	}

	protected override onResolutionChange(): void {

		const resolution = this.resolution;
		this.renderTarget.setSize(resolution.width, resolution.height);

	}

	override render(): void {

		this.setRenderTarget(this.renderTarget);
		this.renderFullscreen();

	}

}
