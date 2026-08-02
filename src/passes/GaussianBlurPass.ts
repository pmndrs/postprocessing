import { ColorSpace, PixelFormat } from "three";
import { RenderTargetResource } from "../core/io/RenderTargetResource.js";
import { TextureResource } from "../core/io/TextureResource.js";
import { Pass } from "../core/Pass.js";
import { GaussianBlurMaterial } from "../materials/GaussianBlurMaterial.js";

/**
 * GaussianBlurPass constructor options.
 *
 * @category Passes
 */

export interface GaussianBlurPassOptions {

	/**
	 * The kernel size. Should be an odd number in the range [3, 1020].
	 *
	 * @defaultValue 35
	 */

	kernelSize?: number;

	/**
	 * The amount of times the blur should be applied.
	 *
	 * Must be greater than 0.
	 *
	 * @defaultValue 1
	 */

	iterations?: number;

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

	private static readonly BUFFER_A = "BUFFER_A";

	/**
	 * Identifies the second blur buffer.
	 */

	private static readonly BUFFER_B = "BUFFER_B";

	/**
	 * @see {@link iterations}
	 */

	private _iterations: number;

	/**
	 * A render target resource used for blurring.
	 */

	private readonly bufferA: RenderTargetResource;

	/**
	 * A render target resource used for blurring.
	 */

	private readonly bufferB: RenderTargetResource;

	/**
	 * Constructs a new Gaussian blur pass.
	 *
	 * @param options - The options.
	 */

	constructor({ kernelSize = 35, iterations = 1 }: GaussianBlurPassOptions = {}) {

		super("GaussianBlurPass");

		this.bufferA = this.output.setBuffer(GaussianBlurPass.BUFFER_A);
		this.bufferB = this.output.setBuffer(GaussianBlurPass.BUFFER_B);

		this.fullscreenMaterial = new GaussianBlurMaterial({ kernelSize });
		this._iterations = iterations;

	}

	// #region Settings

	get kernelSize(): number {

		return this.fullscreenMaterial.kernelSize;

	}

	set kernelSize(value: number) {

		this.fullscreenMaterial.kernelSize = value;

	}

	get iterations(): number {

		return this._iterations;

	}

	set iterations(value: number) {

		this._iterations = Math.max(value, 1);

	}

	// #endregion

	/**
	 * The output texture.
	 */

	get texture(): TextureResource {

		return this.bufferB.texture;

	}

	protected override onInputChange(): void {

		// The output buffer settings depend on the input buffer.
		const inputTexture = this.input.defaultBuffer?.value ?? null;

		if(inputTexture === null) {

			return;

		}

		const { format, type, colorSpace } = inputTexture;

		for(const buffer of [this.bufferA, this.bufferB]) {

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

		const imgData = inputBuffer.source.data as ImageData;
		this.fullscreenMaterial.setSize(imgData.width, imgData.height);

	}

	override render(): void {

		const inputBuffer = this.input.defaultBuffer?.value ?? null;
		const renderTargetA = this.bufferA.value!;
		const renderTargetB = this.bufferB.value!;

		if(this.renderer === null || inputBuffer === null) {

			return;

		}

		const blurMaterial = this.fullscreenMaterial;
		let previousBuffer = inputBuffer;

		for(let i = 0, l = this.iterations; i < l; ++i) {

			// Blur direction: Horizontal
			blurMaterial.direction.set(1.0, 0.0);
			blurMaterial.inputBuffer = previousBuffer;
			this.setRenderTarget(renderTargetA);
			this.renderFullscreen();

			// Blur direction: Vertical
			blurMaterial.direction.set(0.0, 1.0);
			blurMaterial.inputBuffer = renderTargetA.texture;
			this.setRenderTarget(renderTargetB);
			this.renderFullscreen();

			if(i === 0 && l > 1) {

				// Use renderTargetB as input for further blur iterations.
				previousBuffer = renderTargetB.texture;

			}

		}

	}

}
