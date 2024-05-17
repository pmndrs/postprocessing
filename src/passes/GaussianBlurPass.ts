import { Texture, WebGLRenderTarget } from "three";
import { Pass } from "../core/Pass.js";
import { GaussianBlurMaterial } from "../materials/GaussianBlurMaterial.js";
import { Resolution } from "../utils/Resolution.js";

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
	 * The first blur buffer.
	 */

	private readonly renderTargetA: WebGLRenderTarget;

	/**
	 * The second blur buffer.
	 */

	private readonly renderTargetB: WebGLRenderTarget;

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

		const renderTargetA = this.createFramebuffer();
		const renderTargetB = this.createFramebuffer();
		renderTargetA.texture.name = "BUFFER_0";
		renderTargetB.texture.name = "BUFFER_1";
		this.output.setBuffer(renderTargetA.texture.name, renderTargetA);
		this.output.setBuffer(renderTargetB.texture.name, renderTargetB);
		this.renderTargetA = renderTargetA;
		this.renderTargetB = renderTargetB;

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
	 * A texture that contains the blurred result.
	 */

	get texture(): Texture {

		return this.renderTargetB.texture;

	}

	protected override onInputChange(): void {

		if(this.input.defaultBuffer === null || this.input.defaultBuffer.value === null) {

			return;

		}

		const { type, colorSpace } = this.input.defaultBuffer.value;

		this.renderTargetA.texture.type = type;
		this.renderTargetA.texture.colorSpace = colorSpace;
		this.renderTargetA.dispose();

		this.renderTargetB.texture.type = type;
		this.renderTargetB.texture.colorSpace = colorSpace;
		this.renderTargetB.dispose();

		if(this.input.frameBufferPrecisionHigh) {

			this.blurMaterial.defines.FRAME_BUFFER_PRECISION_HIGH = true;

		} else {

			delete this.blurMaterial.defines.FRAME_BUFFER_PRECISION_HIGH;

		}

		this.blurMaterial.needsUpdate = true;

	}

	protected override onResolutionChange(resolution: Resolution): void {

		const w = resolution.width;
		const h = resolution.height;

		this.renderTargetA.setSize(w, h);
		this.renderTargetB.setSize(w, h);

		// Optimization: 1 / (TexelSize * ResolutionScale) = FullResolution
		this.blurMaterial.setSize(resolution.baseWidth, resolution.baseHeight);

	}

	override render(): void {

		if(this.renderer === null || this.input.defaultBuffer?.value === null) {

			return;

		}

		const renderer = this.renderer;
		const renderTargetA = this.renderTargetA;
		const renderTargetB = this.renderTargetB;
		const blurMaterial = this.blurMaterial;

		let previousBuffer = this.input.defaultBuffer!.value;

		for(let i = 0, l = Math.max(this.iterations, 1); i < l; ++i) {

			// Blur direction: Horizontal
			blurMaterial.direction.set(1.0, 0.0);
			blurMaterial.inputBuffer = previousBuffer;
			renderer.setRenderTarget(renderTargetA);
			this.renderFullscreen();

			// Blur direction: Vertical
			blurMaterial.direction.set(0.0, 1.0);
			blurMaterial.inputBuffer = renderTargetA.texture;
			renderer.setRenderTarget(renderTargetB);
			this.renderFullscreen();

			if(i === 0 && l > 1) {

				// Use renderTargetB as input for further blur iterations.
				previousBuffer = renderTargetB.texture;

			}

		}

	}

}
