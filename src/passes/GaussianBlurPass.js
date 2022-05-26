import { LinearFilter, sRGBEncoding, UnsignedByteType, WebGLRenderTarget } from "three";
import { CopyMaterial, GaussianBlurMaterial } from "../materials";
import { Resolution } from "../core";
import { Pass } from "./Pass";

/**
 * A Gaussian blur pass.
 */

export class GaussianBlurPass extends Pass {

	/**
	 * Constructs a new Gaussian blur pass.
	 *
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.kernelSize=35] - The kernel size. Should be an odd number in the range [3, 1020].
	 * @param {Number} [options.resolutionScale=1.0] - The resolution scale.
	 * @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - The horizontal resolution.
	 * @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - The vertical resolution.
	 */

	constructor({
		kernelSize = 35,
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

		this.renderTargetA = new WebGLRenderTarget(1, 1, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			stencilBuffer: false,
			depthBuffer: false
		});

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

		// Blur direction: Horizontal
		blurMaterial.direction.set(1.0, 0.0);
		blurMaterial.inputBuffer = inputBuffer.texture;
		renderer.setRenderTarget(renderTargetA);
		renderer.render(scene, camera);

		// Blur direction: Vertical
		blurMaterial.direction.set(0.0, 1.0);
		blurMaterial.inputBuffer = renderTargetA.texture;
		renderer.setRenderTarget(renderTargetB);
		renderer.render(scene, camera);

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
		this.blurMaterial.setSize(w, h);
		this.blurMaterial.resolutionScale = resolution.scale;

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

				this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";

			} else if(renderer.outputEncoding === sRGBEncoding) {

				this.renderTargetA.texture.encoding = sRGBEncoding;
				this.renderTargetB.texture.encoding = sRGBEncoding;

			}

		}

	}

}
