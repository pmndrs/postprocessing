import { ColorSpace, PixelFormat } from "three";
import { RenderTargetResource } from "../core/io/RenderTargetResource.js";
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
	 * Identifies the luminance buffer.
	 */

	private static readonly BUFFER_LUMINANCE = "BUFFER_LUMINANCE";

	/**
	 * The luminance buffer resource.
	 */

	private readonly buffer: RenderTargetResource;

	/**
	 * Constructs a new luminance pass.
	 */

	constructor() {

		super("LuminancePass");

		this.buffer = this.output.setBuffer(LuminancePass.BUFFER_LUMINANCE);
		this.fullscreenMaterial = new LuminanceHighPassMaterial();

	}

	/**
	 * The luminance texture.
	 */

	get texture(): TextureResource {

		return this.buffer.texture;

	}

	protected override onInputChange(): void {

		// The output buffer settings depend on the input buffer.
		const inputTexture = this.input.defaultBuffer?.value ?? null;

		if(inputTexture === null) {

			return;

		}

		this.buffer.descriptor.setValues({
			colorSpace: inputTexture.colorSpace as ColorSpace,
			format: inputTexture.format as PixelFormat,
			type: inputTexture.type
		});

		this.fullscreenMaterial.outputPrecision = this.input.frameBufferPrecisionHigh ? "mediump" : "lowp";

	}

	override render(): void {

		this.setRenderTarget(this.buffer.value);
		this.renderFullscreen();

	}

}
