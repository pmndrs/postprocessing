import { BasicDepthPacking, SRGBColorSpace, UnsignedByteType, WebGLRenderTarget } from "three";
import { Resolution } from "../core/Resolution.js";
import { CopyMaterial } from "../materials/CopyMaterial.js";
import { BoxBlurMaterial } from "../materials/BoxBlurMaterial.js";
import { Pass } from "./Pass.js";

/**
 * A box blur pass.
 */

export class BoxBlurPass extends Pass {

	/**
	 * Constructs a new box blur pass.
	 *
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.kernelSize=5] - Must be an odd number. The sizes 3 and 5 use optimized code paths.
	 * @param {Number} [options.iterations=1] - The amount of times the blur should be applied.
	 * @param {Number} [options.bilateral=false] - Enables or disables bilateral blurring.
	 * @param {Number} [options.resolutionScale=1.0] - The resolution scale.
	 * @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - The horizontal resolution.
	 * @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - The vertical resolution.
	 */

	constructor({
		kernelSize = 5,
		iterations = 1,
		bilateral = false,
		resolutionScale = 1.0,
		resolutionX = Resolution.AUTO_SIZE,
		resolutionY = Resolution.AUTO_SIZE
	} = {}) {

		super("BoxBlurPass");

		this.needsDepthTexture = bilateral;

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

		this.renderTargetB = new WebGLRenderTarget(1, 1, { depthBuffer: false });
		this.renderTargetB.texture.name = "Blur.Target.B";

		/**
		 * The blur material.
		 *
		 * @type {BoxBlurMaterial}
		 * @readonly
		 */

		this.blurMaterial = new BoxBlurMaterial({ bilateral, kernelSize });

		/**
		 * A copy material.
		 *
		 * @type {CopyMaterial}
		 * @readonly
		 */

		this.copyMaterial = new CopyMaterial();

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

	set mainCamera(value) {

		this.blurMaterial.copyCameraSettings(value);

	}

	/**
	 * Sets the depth texture.
	 *
	 * @param {Texture} depthTexture - A depth texture.
	 * @param {DepthPackingStrategies} [depthPacking=BasicDepthPacking] - The depth packing strategy.
	 */

	setDepthTexture(depthTexture, depthPacking = BasicDepthPacking) {

		this.blurMaterial.depthBuffer = depthTexture;
		this.blurMaterial.depthPacking = depthPacking;

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

			// Alternate between targets.
			const buffer = ((i & 1) === 0) ? renderTargetA : renderTargetB;
			blurMaterial.inputBuffer = previousBuffer.texture;
			renderer.setRenderTarget(buffer);
			renderer.render(scene, camera);
			previousBuffer = buffer;

		}

		// Copy the result to the output buffer.
		this.copyMaterial.inputBuffer = previousBuffer.texture;
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

		if(renderer !== null) {

			this.blurMaterial.maxVaryingVectors = renderer.capabilities.maxVaryings;

		}

		if(frameBufferType !== undefined) {

			this.renderTargetA.texture.type = frameBufferType;
			this.renderTargetB.texture.type = frameBufferType;

			if(frameBufferType !== UnsignedByteType) {

				this.fullscreenMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";

			} else if(renderer !== null && renderer.outputColorSpace === SRGBColorSpace) {

				this.renderTargetA.texture.colorSpace = SRGBColorSpace;
				this.renderTargetB.texture.colorSpace = SRGBColorSpace;

			}

		}

	}

}
