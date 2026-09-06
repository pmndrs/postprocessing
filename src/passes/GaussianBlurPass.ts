import { ColorSpace, PixelFormat } from "three";
import { RenderTargetResource } from "../core/io/RenderTargetResource.js";
import { TextureResource } from "../core/io/TextureResource.js";
import { Pass } from "../core/Pass.js";
import { GaussianBlurMaterial, GaussianBlurMaterialOptions } from "../materials/GaussianBlurMaterial.js";

/**
 * GaussianBlurPass constructor options.
 *
 * @category Passes
 */

export interface GaussianBlurPassOptions extends GaussianBlurMaterialOptions {

	/**
	 * The resolution scale.
	 *
	 * @defaultValue 1
	 */

	resolutionScale?: number;

}

/**
 * A Gaussian blur pass.
 *
 * @category Passes
 */

export class GaussianBlurPass extends Pass<GaussianBlurMaterial> implements GaussianBlurPassOptions {

	/**
	 * Identifies the first blur buffer.
	 */

	private static readonly BUFFER_X = "buffer-x";

	/**
	 * Identifies the second blur buffer.
	 */

	private static readonly BUFFER_Y = "buffer-y";

	/**
	 * A render target for horizontal blurring.
	 */

	private readonly bufferX: RenderTargetResource;

	/**
	 * A render target for vertical blurring.
	 */

	private readonly bufferY: RenderTargetResource;

	/**
	 * Constructs a new Gaussian blur pass.
	 *
	 * @param options - The options.
	 */

	constructor({ kernelSize, sigma, resolutionScale = 1.0 }: GaussianBlurPassOptions = {}) {

		super("GaussianBlurPass");

		this.bufferX = this.setBuffer(GaussianBlurPass.BUFFER_X);
		this.bufferY = this.setBuffer(GaussianBlurPass.BUFFER_Y);

		this.fullscreenMaterial = new GaussianBlurMaterial({ kernelSize, sigma });
		this.resolutionScale = resolutionScale;

	}

	// #region Settings

	get kernelSize(): number {

		return this.fullscreenMaterial.kernelSize;

	}

	set kernelSize(value: number) {

		this.fullscreenMaterial.kernelSize = value;

	}

	get sigma(): number {

		return this.fullscreenMaterial.sigma;

	}

	set sigma(value: number) {

		this.fullscreenMaterial.sigma = value;

	}

	get resolutionScale(): number {

		return this.resolution.scale;

	}

	set resolutionScale(value: number) {

		this.resolution.scale = value;

	}

	// #endregion

	/**
	 * The output texture.
	 */

	get texture(): TextureResource {

		return this.bufferY.texture;

	}

	protected override onInputChange(): void {

		// The output buffer settings depend on the input buffer.
		const inputTexture = this.input.defaultBuffer?.value ?? null;

		if(inputTexture === null) {

			return;

		}

		const { format, type, colorSpace } = inputTexture;

		for(const buffer of [this.bufferX, this.bufferY]) {

			buffer.descriptor.setValues({
				colorSpace: colorSpace as ColorSpace,
				format: format as PixelFormat,
				type
			});

		}

		this.fullscreenMaterial.outputPrecision = this.input.frameBufferPrecisionHigh ? "mediump" : "lowp";
		this.onResolutionChange();

	}

	protected override onResolutionChange(): void {

		// Use the size of the input texture to calculate the texel size for sampling.
		const inputBuffer = this.input.defaultBuffer?.value ?? null;

		if(inputBuffer === null) {

			return;

		}

		const resolution = this.resolution;
		const inputBufferSize = inputBuffer.source.data as ImageData;
		// Downsample only along the blurred axis to avoid undersampling and aliasing on the other axis.
		this.bufferX.resolution.setSize(resolution.width, inputBufferSize.height);
		this.bufferY.resolution.setSize(resolution.width, resolution.height);

	}

	override render(): void {

		const inputBuffer = this.input.defaultBuffer?.value ?? null;
		const renderTargetX = this.bufferX.value!;
		const renderTargetY = this.bufferY.value!;

		if(this.renderer === null || inputBuffer === null) {

			return;

		}

		// Downsample only along the axis being blurred:
		// W × H ──[blur X + ↓X]──► W' × H ──[blur Y + ↓Y]──► W' × H'

		const inputBufferSize = inputBuffer.source.data as ImageData;
		const blurMaterial = this.fullscreenMaterial;

		// Blur direction: Horizontal
		blurMaterial.direction.set(1.0, 0.0);
		blurMaterial.setSize(inputBufferSize.width, inputBufferSize.height);
		blurMaterial.inputBuffer = inputBuffer;
		this.setRenderTarget(renderTargetX);
		this.renderFullscreen();

		// Blur direction: Vertical
		blurMaterial.direction.set(0.0, 1.0);
		blurMaterial.setSize(renderTargetX.width, renderTargetX.height);
		blurMaterial.inputBuffer = renderTargetX.texture;
		this.setRenderTarget(renderTargetY);
		this.renderFullscreen();

	}

}
