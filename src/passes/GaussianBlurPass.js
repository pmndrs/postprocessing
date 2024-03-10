import { SRGBColorSpace, UnsignedByteType, WebGLRenderTarget } from "three";
import { Resolution } from "../core/Resolution.js";
import { CopyMaterial } from "../materials/CopyMaterial.js";
import { GaussianBlurMaterial } from "../materials/GaussianBlurMaterial.js";
import { Pass } from "./Pass.js";

/**
 * A Gaussian blur pass.
 */

export class GaussianBlurPass extends Pass {

	/**
	 * Constructs a new Gaussian blur pass.
	 *
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.kernelSize=35] - The kernel size. Should be an odd number in the range [3, 1020].
	 * @param {Number} [options.iterations=1] - The amount of times the blur should be applied.
	 * @param {Number} [options.resolutionScale=1.0] - The resolution scale.
	 * @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - The horizontal resolution.
	 * @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - The vertical resolution.
	 */

	constructor({
		kernelSize = 35,
		iterations = 1,
		resolutionScale = 1.0,
		resolutionX = Resolution.AUTO_SIZE,
		resolutionY = Resolution.AUTO_SIZE
	} = {}) {

		super("GaussianBlurPass");

		/**
		 * A render target.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetA = new WebGLRenderTarget(1, 1, { depthBuffer: false });
		this.renderTargetA.texture.name = "Blur.Target.A";

		/**
		 * A render target.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetB = this.renderTargetA.clone();
		this.renderTargetB.texture.name = "Blur.Target.B";

		/**
		 * The blur material.
		 *
		 * @type {GaussianBlurMaterial}
		 * @readonly
		 */

		this.blurMaterial = new GaussianBlurMaterial({ kernelSize });

		/**
		 * A copy material.
		 *
		 * @type {CopyMaterial}
		 * @readonly
		 */

		this.copyMaterial = new CopyMaterial();
		this.copyMaterial.inputBuffer = this.renderTargetB.texture;

		/**
		 * The render resolution.
		 *
		 * @type {Resolution}
		 * @readonly
		 */

		const resolution = this.resolution = new Resolution(this, resolutionX, resolutionY, resolutionScale);
		resolution.addEventListener("change", (e) => this.setSize(resolution.baseWidth, resolution.baseHeight));

		/**
		 * The amount of blur iterations.
		 *
		 * @type {Number}
		 */

		this.iterations = iterations;

	}

	/**
	 * Renders the blur.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {WebGLRenderTarget} outputBuffer - A frame buffer that serves as the output render target unless this pass renders to screen.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 * @param {Boolean} [stencilTest] - Indicates whether a stencil mask is active.
	 */

	render(renderer, inputBuffer, outputBuffer, deltaTime, stencilTest) {

		const scene = this.scene;
		const camera = this.camera;
		const renderTargetA = this.renderTargetA;
		const renderTargetB = this.renderTargetB;
		const blurMaterial = this.blurMaterial;
		this.fullscreenMaterial = blurMaterial;

		let previousBuffer = inputBuffer;

		for(let i = 0, l = Math.max(this.iterations, 1); i < l; ++i) {

			// Blur direction: Horizontal
			blurMaterial.direction.set(1.0, 0.0);
			blurMaterial.inputBuffer = previousBuffer.texture;
			renderer.setRenderTarget(renderTargetA);
			renderer.render(scene, camera);

			// Blur direction: Vertical
			blurMaterial.direction.set(0.0, 1.0);
			blurMaterial.inputBuffer = renderTargetA.texture;
			renderer.setRenderTarget(renderTargetB);
			renderer.render(scene, camera);

			if(i === 0 && l > 1) {

				// Use renderTargetB as input for further blur iterations.
				previousBuffer = renderTargetB;

			}

		}

		// Copy the result to the output buffer.
		this.fullscreenMaterial = this.copyMaterial;
		renderer.setRenderTarget(this.renderToScreen ? null : outputBuffer);
		renderer.render(scene, camera);

	}

	/**
	 * Updates the size of this pass.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		const resolution = this.resolution;
		resolution.setBaseSize(width, height);
		const w = resolution.width, h = resolution.height;
		this.renderTargetA.setSize(w, h);
		this.renderTargetB.setSize(w, h);

		// Optimization: 1 / (TexelSize * ResolutionScale) = FullResolution
		this.blurMaterial.setSize(width, height);

	}

	/**
	 * Performs initialization tasks.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 * @param {Number} frameBufferType - The type of the main frame buffers.
	 */

	initialize(renderer, alpha, frameBufferType) {

		if(frameBufferType !== undefined) {

			this.renderTargetA.texture.type = frameBufferType;
			this.renderTargetB.texture.type = frameBufferType;

			if(frameBufferType !== UnsignedByteType) {

				this.blurMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";
				this.copyMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";

			} else if(renderer !== null && renderer.outputColorSpace === SRGBColorSpace) {

				this.renderTargetA.texture.colorSpace = SRGBColorSpace;
				this.renderTargetB.texture.colorSpace = SRGBColorSpace;

			}

		}

	}

}
