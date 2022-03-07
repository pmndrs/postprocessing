import { LinearFilter, sRGBEncoding, UnsignedByteType, WebGLRenderTarget } from "three";
import { KawaseBlurMaterial } from "../materials";
import { KernelSize, Resolution } from "../core";
import { Pass } from "./Pass";

const kernelPresets = [
	new Float32Array([0.0, 0.0]),
	new Float32Array([0.0, 1.0, 1.0]),
	new Float32Array([0.0, 1.0, 1.0, 2.0]),
	new Float32Array([0.0, 1.0, 2.0, 2.0, 3.0]),
	new Float32Array([0.0, 1.0, 2.0, 3.0, 4.0, 4.0, 5.0]),
	new Float32Array([0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 7.0, 8.0, 9.0, 10.0])
];

/**
 * A Kawase blur pass.
 */

export class KawaseBlurPass extends Pass {

	/**
	 * Constructs a new Kawase blur pass.
	 *
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.resolutionScale=0.5] - Deprecated. Adjust the height or width instead for consistent results.
	 * @param {Number} [options.width=Resolution.AUTO_SIZE] - The blur render width.
	 * @param {Number} [options.height=Resolution.AUTO_SIZE] - The blur render height.
	 * @param {KernelSize} [options.kernelSize=KernelSize.LARGE] - The blur kernel size.
	 */

	constructor({
		resolutionScale = 0.5,
		width = Resolution.AUTO_SIZE,
		height = Resolution.AUTO_SIZE,
		kernelSize = KernelSize.LARGE
	} = {}) {

		super("KawaseBlurPass");

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
		 * The render resolution.
		 *
		 * It's recommended to set the render height or width to an absolute value for consistent results across different
		 * devices and screen resolutions.
		 *
		 * @type {Resolution}
		 */

		const resolution = this.resolution = new Resolution(this, width, height, resolutionScale);
		resolution.addEventListener("change", (e) => this.setSize(resolution.baseWidth, resolution.baseHeight));

		/**
		 * The blur material.
		 *
		 * @type {KawaseBlurMaterial}
		 * @private
		 */

		this.blurMaterial = new KawaseBlurMaterial();

		/**
		 * A second blur material that uses dithering.
		 *
		 * @type {KawaseBlurMaterial}
		 * @private
		 */

		this.ditheredBlurMaterial = new KawaseBlurMaterial();
		this.ditheredBlurMaterial.uniforms.scale = this.blurMaterial.uniforms.scale;
		this.ditheredBlurMaterial.dithering = true;

		/**
		 * Indicates whether dithering is enabled.
		 *
		 * @type {Boolean}
		 * @deprecated
		 */

		this.dithering = false;

		/**
		 * The kernel size.
		 *
		 * @type {KernelSize}
		 * @deprecated Use getKernelSize() and setKernelSize() instead.
		 */

		this.kernelSize = kernelSize;

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
	 * @deprecated Use getScale() instead.
	 */

	get scale() {

		return this.blurMaterial.scale;

	}

	/**
	 * @type {Number}
	 * @deprecated Use setScale() instead.
	 */

	set scale(value) {

		this.blurMaterial.scale = value;

	}

	/**
	 * Returns the current blur scale.
	 *
	 * @return {Number} The scale.
	 */

	getScale() {

		return this.blurMaterial.scale;

	}

	/**
	 * Sets the blur scale.
	 *
	 * This value influences the overall blur strength and should not be greater than 1. For larger blurs please increase
	 * the kernel size via {@link setKernelSize}!
	 *
	 * Note that the blur strength is closely tied to the resolution. For a smooth transition from no blur to full blur,
	 * set the width or the height to a high enough value.
	 *
	 * @param {Number} value - The scale.
	 */

	setScale(value) {

		this.blurMaterial.scale = value;

	}

	/**
	 * Returns the kernel size.
	 *
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
	 * Blurs the input buffer and writes the result to the output buffer. The input buffer remains intact, unless it's
	 * also used as the output buffer.
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
		const kernels = kernelPresets[this.kernelSize];

		let material = this.blurMaterial;
		let previousBuffer = inputBuffer;
		let i, l;

		this.fullscreenMaterial = material;

		// Apply the multi-pass blur.
		for(i = 0, l = kernels.length - 1; i < l; ++i) {

			// Alternate between targets.
			const buffer = ((i & 1) === 0) ? renderTargetA : renderTargetB;

			material.kernel = kernels[i];
			material.inputBuffer = previousBuffer.texture;
			renderer.setRenderTarget(buffer);
			renderer.render(scene, camera);
			previousBuffer = buffer;

		}

		if(this.dithering) {

			material = this.ditheredBlurMaterial;
			this.fullscreenMaterial = material;

		}

		material.kernel = kernels[i];
		material.inputBuffer = previousBuffer.texture;
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
		this.ditheredBlurMaterial.setSize(w, h);

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
				this.ditheredBlurMaterial.defines.FRAMEBUFFER_PRECISION_HIGH = "1";

			} else if(renderer.outputEncoding === sRGBEncoding) {

				this.renderTargetA.texture.encoding = sRGBEncoding;
				this.renderTargetB.texture.encoding = sRGBEncoding;

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
