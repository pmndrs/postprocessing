import { WebGLRenderTarget } from "three";
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
	 * @defaultValue 1
	 */

	iterations?: number;

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

export class GaussianBlurPass extends Pass<GaussianBlurMaterial> {

	/**
	 * Identifies the first blur buffer.
	 */

	private static readonly BUFFER_A = "BUFFER_A";

	/**
	 * Identifies the second blur buffer.
	 */

	private static readonly BUFFER_B = "BUFFER_B";

	/**
	 * The amount of blur iterations.
	 */

	iterations: number;

	/**
	 * Constructs a new Gaussian blur pass.
	 *
	 * @param options - The options.
	 */

	constructor({ kernelSize = 35, iterations = 1, resolutionScale = 1 }: GaussianBlurPassOptions = {}) {

		super("GaussianBlurPass");

		this.output.setBuffer(GaussianBlurPass.BUFFER_A, this.createFramebuffer());
		this.output.setBuffer(GaussianBlurPass.BUFFER_B, this.createFramebuffer());

		this.fullscreenMaterial = new GaussianBlurMaterial({ kernelSize });
		this.resolution.scale = resolutionScale;
		this.iterations = iterations;

	}

	/**
	 * The blur material.
	 */

	private get blurMaterial(): GaussianBlurMaterial {

		return this.fullscreenMaterial;

	}

	/**
	 * The first blur render target.
	 */

	private get renderTargetA(): WebGLRenderTarget {

		return this.output.getBuffer(GaussianBlurPass.BUFFER_A)!;

	}

	/**
	 * The second blur render target.
	 */

	private get renderTargetB(): WebGLRenderTarget {

		return this.output.getBuffer(GaussianBlurPass.BUFFER_B)!;

	}

	/**
	 * A texture that contains the blurred result.
	 */

	get texture(): TextureResource {

		return this.output.buffers.get(GaussianBlurPass.BUFFER_B)!.texture;

	}

	protected override onInputChange(): void {

		if(this.input.defaultBuffer === null || this.input.defaultBuffer.value === null) {

			return;

		}

		const { format, internalFormat, type, colorSpace } = this.input.defaultBuffer.value;

		for(const renderTarget of [this.renderTargetA, this.renderTargetB]) {

			const texture = renderTarget.texture;
			texture.format = format;
			texture.internalFormat = internalFormat;
			texture.type = type;
			texture.colorSpace = colorSpace;
			renderTarget.dispose();

		}

		if(this.input.frameBufferPrecisionHigh) {

			this.blurMaterial.defines.FRAME_BUFFER_PRECISION_HIGH = true;

		} else {

			delete this.blurMaterial.defines.FRAME_BUFFER_PRECISION_HIGH;

		}

		this.blurMaterial.needsUpdate = true;

	}

	protected override onResolutionChange(): void {

		const resolution = this.resolution;
		const width = resolution.width;
		const height = resolution.height;

		this.renderTargetA.setSize(width, height);
		this.renderTargetB.setSize(width, height);

		// Optimization: 1 / (TexelSize * ResolutionScale) = FullResolution
		this.blurMaterial.setSize(resolution.baseWidth, resolution.baseHeight);

	}

	override render(): void {

		if(this.renderer === null || this.input.defaultBuffer === null || this.input.defaultBuffer.value === null) {

			return;

		}

		const renderTargetA = this.renderTargetA;
		const renderTargetB = this.renderTargetB;
		const blurMaterial = this.blurMaterial;

		let previousBuffer = this.input.defaultBuffer.value;

		for(let i = 0, l = Math.max(this.iterations, 1); i < l; ++i) {

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
