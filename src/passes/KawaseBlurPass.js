import { SRGBColorSpace, UnsignedByteType, WebGLRenderTarget } from "three";
import { Resolution } from "../core/Resolution.js";
import { KernelSize } from "../enums/KernelSize.js";
import { CopyMaterial } from "../materials/CopyMaterial.js";
import { KawaseBlurMaterial } from "../materials/KawaseBlurMaterial.js";
import { Pass } from "./Pass.js";

/**
 * A Kawase blur pass.
 *
 * Provides better performance compared to {@link GaussianBlurPass} at larger kernel sizes.
 */

export class KawaseBlurPass extends Pass {

	/**
	 * Constructs a new Kawase blur pass.
	 *
	 * @param {Object} [options] - The options.
	 * @param {KernelSize} [options.kernelSize=KernelSize.MEDIUM] - The blur kernel size.
	 * @param {Number} [options.resolutionScale=0.5] - The resolution scale.
	 * @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - The horizontal resolution.
	 * @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - The vertical resolution.
	 * @param {Number} [options.width=Resolution.AUTO_SIZE] - Deprecated. Use resolutionX instead.
	 * @param {Number} [options.height=Resolution.AUTO_SIZE] - Deprecated. Use resolutionY instead.
	 */

	constructor({
		kernelSize = KernelSize.MEDIUM,
		resolutionScale = 0.5,
		width = Resolution.AUTO_SIZE,
		height = Resolution.AUTO_SIZE,
		resolutionX = width,
		resolutionY = height
	} = {}) {

		super("KawaseBlurPass");

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
		 * The render resolution.
		 *
		 * @type {Resolution}
		 * @readonly
		 */

		const resolution = this.resolution = new Resolution(this, resolutionX, resolutionY, resolutionScale);
		resolution.addEventListener("change", (e) => this.setSize(resolution.baseWidth, resolution.baseHeight));

		/**
		 * @see {@link blurMaterial}
		 * @type {KawaseBlurMaterial}
		 * @private
		 */

		this._blurMaterial = new KawaseBlurMaterial();
		this._blurMaterial.kernelSize = kernelSize;

		/**
		 * A copy material.
		 *
		 * @type {CopyMaterial}
		 * @readonly
		 */

		this.copyMaterial = new CopyMaterial();

	}

	/**
	 * Returns the resolution settings.
	 *
	 * @deprecated Use resolution instead.
	 * @return {Resolution} The resolution.
	 */

	getResolution() {

		return this.resolution;

	}

	/**
	 * The blur material.
	 *
	 * @type {KawaseBlurMaterial}
	 */

	get blurMaterial() {

		return this._blurMaterial;

	}

	/**
	 * The blur material.
	 *
	 * @type {KawaseBlurMaterial}
	 * @protected
	 */

	set blurMaterial(value) {

		this._blurMaterial = value;

	}

	/**
	 * Indicates whether dithering is enabled.
	 *
	 * @type {Boolean}
	 * @deprecated Use copyMaterial.dithering instead.
	 */

	get dithering() {

		return this.copyMaterial.dithering;

	}

	set dithering(value) {

		this.copyMaterial.dithering = value;

	}

	/**
	 * The kernel size.
	 *
	 * @type {KernelSize}
	 * @deprecated Use blurMaterial.kernelSize instead.
	 */

	get kernelSize() {

		return this.blurMaterial.kernelSize;

	}

	set kernelSize(value) {

		this.blurMaterial.kernelSize = value;

	}

	/**
	 * The current width of the internal render targets.
	 *
	 * @type {Number}
	 * @deprecated Use resolution.width instead.
	 */

	get width() {

		return this.resolution.width;

	}

	/**
	 * Sets the render width.
	 *
	 * @type {Number}
	 * @deprecated Use resolution.preferredWidth instead.
	 */

	set width(value) {

		this.resolution.preferredWidth = value;

	}

	/**
	 * The current height of the internal render targets.
	 *
	 * @type {Number}
	 * @deprecated Use resolution.height instead.
	 */

	get height() {

		return this.resolution.height;

	}

	/**
	 * Sets the render height.
	 *
	 * @type {Number}
	 * @deprecated Use resolution.preferredHeight instead.
	 */

	set height(value) {

		this.resolution.preferredHeight = value;

	}

	/**
	 * The current blur scale.
	 *
	 * @type {Number}
	 * @deprecated Use blurMaterial.scale instead.
	 */

	get scale() {

		return this.blurMaterial.scale;

	}

	set scale(value) {

		this.blurMaterial.scale = value;

	}

	/**
	 * Returns the current blur scale.
	 *
	 * @deprecated Use blurMaterial.scale instead.
	 * @return {Number} The scale.
	 */

	getScale() {

		return this.blurMaterial.scale;

	}

	/**
	 * Sets the blur scale.
	 *
	 * @deprecated Use blurMaterial.scale instead.
	 * @param {Number} value - The scale.
	 */

	setScale(value) {

		this.blurMaterial.scale = value;

	}

	/**
	 * Returns the kernel size.
	 *
	 * @deprecated Use blurMaterial.kernelSize instead.
	 * @return {KernelSize} The kernel size.
	 */

	getKernelSize() {

		return this.kernelSize;

	}

	/**
	 * Sets the kernel size.
	 *
	 * Larger kernels require more processing power but scale well with larger render resolutions.
	 *
	 * @deprecated Use blurMaterial.kernelSize instead.
	 * @param {KernelSize} value - The kernel size.
	 */

	setKernelSize(value) {

		this.kernelSize = value;

	}

	/**
	 * Returns the current resolution scale.
	 *
	 * @return {Number} The resolution scale.
	 * @deprecated Use resolution instead.
	 */

	getResolutionScale() {

		return this.resolution.scale;

	}

	/**
	 * Sets the resolution scale.
	 *
	 * @param {Number} scale - The new resolution scale.
	 * @deprecated Use resolution instead.
	 */

	setResolutionScale(scale) {

		this.resolution.scale = scale;

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
		const material = this.blurMaterial;
		const kernelSequence = material.kernelSequence;

		let previousBuffer = inputBuffer;
		this.fullscreenMaterial = material;

		// Render the multi-pass blur.
		for(let i = 0, l = kernelSequence.length; i < l; ++i) {

			// Alternate between targets.
			const buffer = ((i & 1) === 0) ? renderTargetA : renderTargetB;
			material.kernel = kernelSequence[i];
			material.inputBuffer = previousBuffer.texture;
			renderer.setRenderTarget(buffer);
			renderer.render(scene, camera);
			previousBuffer = buffer;

		}

		// Copy the result to the output buffer.
		this.fullscreenMaterial = this.copyMaterial;
		this.copyMaterial.inputBuffer = previousBuffer.texture;
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

	/**
	 * An auto sizing flag.
	 *
	 * @type {Number}
	 * @deprecated Use {@link Resolution.AUTO_SIZE} instead.
	 */

	static get AUTO_SIZE() {

		return Resolution.AUTO_SIZE;

	}

}
