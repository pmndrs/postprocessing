import { LinearFilter, RGBFormat, Vector2, WebGLRenderTarget } from "three";
import { ConvolutionMaterial, KernelSize } from "../materials";
import { Pass } from "./Pass.js";

/**
 * An auto sizing constant.
 *
 * @type {Number}
 * @private
 */

const AUTO_SIZE = -1;

/**
 * An efficient, incremental blur pass.
 */

export class BlurPass extends Pass {

	/**
	 * Constructs a new blur pass.
	 *
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.resolutionScale=0.5] - Deprecated. Adjust the height or width instead for consistent results.
	 * @param {Number} [options.width=BlurPass.AUTO_SIZE] - The blur render width.
	 * @param {Number} [options.height=BlurPass.AUTO_SIZE] - The blur render height.
	 * @param {KernelSize} [options.kernelSize=KernelSize.LARGE] - The blur kernel size.
	 */

	constructor({
		resolutionScale = 0.5,
		width = AUTO_SIZE,
		height = AUTO_SIZE,
		kernelSize = KernelSize.LARGE
	} = {}) {

		super("BlurPass");

		/**
		 * A render target.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetX = new WebGLRenderTarget(1, 1, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			stencilBuffer: false,
			depthBuffer: false
		});

		this.renderTargetX.texture.name = "Blur.TargetX";

		/**
		 * A second render target.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetY = this.renderTargetX.clone();
		this.renderTargetY.texture.name = "Blur.TargetY";

		/**
		 * The current main render size.
		 *
		 * @type {Vector2}
		 * @private
		 */

		this.originalSize = new Vector2();

		/**
		 * The absolute render resolution.
		 *
		 * @type {Vector2}
		 * @private
		 */

		this.resolution = new Vector2(width, height);

		/**
		 * The current resolution scale.
		 *
		 * @type {Number}
		 * @private
		 * @deprecated
		 */

		this.resolutionScale = resolutionScale;

		/**
		 * A convolution shader material.
		 *
		 * @type {ConvolutionMaterial}
		 * @private
		 */

		this.convolutionMaterial = new ConvolutionMaterial();

		/**
		 * A convolution shader material that uses dithering.
		 *
		 * @type {ConvolutionMaterial}
		 * @private
		 */

		this.ditheredConvolutionMaterial = new ConvolutionMaterial();
		this.ditheredConvolutionMaterial.dithering = true;

		/**
		 * Whether the blurred result should also be dithered using noise.
		 *
		 * @type {Boolean}
		 */

		this.dithering = false;

		this.kernelSize = kernelSize;

	}

	/**
	 * The current width of the internal render targets.
	 *
	 * @type {Number}
	 */

	get width() {

		return this.renderTargetX.width;

	}

	/**
	 * Sets the render width.
	 *
	 * Use {@link BlurPass.AUTO_SIZE} to activate automatic sizing based on the
	 * render height and aspect ratio.
	 *
	 * @type {Number}
	 */

	set width(value) {

		this.resolution.x = value;
		this.setSize(this.originalSize.x, this.originalSize.y);

	}

	/**
	 * The current height of the internal render targets.
	 *
	 * @type {Number}
	 */

	get height() {

		return this.renderTargetX.height;

	}

	/**
	 * Sets the render height.
	 *
	 * Use {@link BlurPass.AUTO_SIZE} to activate automatic sizing based on the
	 * render width and aspect ratio.
	 *
	 * @type {Number}
	 */

	set height(value) {

		this.resolution.y = value;
		this.setSize(this.originalSize.x, this.originalSize.y);

	}

	/**
	 * The current blur scale.
	 *
	 * @type {Number}
	 */

	get scale() {

		return this.convolutionMaterial.uniforms.scale.value;

	}

	/**
	 * Sets the blur scale.
	 *
	 * This value influences the overall blur strength and should not be greater
	 * than 1. For larger blurs please increase the {@link kernelSize}!
	 *
	 * Note that the blur strength is closely tied to the resolution. For a smooth
	 * transition from no blur to full blur, set the width or the height to a high
	 * enough value.
	 *
	 * @type {Number}
	 */

	set scale(value) {

		this.convolutionMaterial.uniforms.scale.value = value;
		this.ditheredConvolutionMaterial.uniforms.scale.value = value;

	}

	/**
	 * The kernel size.
	 *
	 * @type {KernelSize}
	 */

	get kernelSize() {

		return this.convolutionMaterial.kernelSize;

	}

	/**
	 * Sets the kernel size.
	 *
	 * Larger kernels require more processing power but scale well with larger
	 * render resolutions.
	 *
	 * @type {KernelSize}
	 */

	set kernelSize(value) {

		this.convolutionMaterial.kernelSize = value;
		this.ditheredConvolutionMaterial.kernelSize = value;

	}

	/**
	 * Returns the original resolution.
	 *
	 * @return {Vector2} The original resolution received via {@link setSize}.
	 * @deprecated Added for internal use only.
	 */

	getOriginalSize() {

		return this.originalSize;

	}

	/**
	 * Returns the current resolution scale.
	 *
	 * @return {Number} The resolution scale.
	 * @deprecated Adjust the width or height instead.
	 */

	getResolutionScale() {

		return this.resolutionScale;

	}

	/**
	 * Sets the resolution scale.
	 *
	 * @param {Number} scale - The new resolution scale.
	 * @deprecated Adjust the width or height instead.
	 */

	setResolutionScale(scale) {

		this.resolutionScale = scale;
		this.setSize(this.originalSize.x, this.originalSize.y);

	}

	/**
	 * Blurs the input buffer and writes the result to the output buffer. The
	 * input buffer remains intact, unless it's also the output buffer.
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

		const renderTargetX = this.renderTargetX;
		const renderTargetY = this.renderTargetY;

		let material = this.convolutionMaterial;
		let uniforms = material.uniforms;
		const kernel = material.getKernel();

		let lastRT = inputBuffer;
		let destRT;
		let i, l;

		this.setFullscreenMaterial(material);

		// Apply the multi-pass blur.
		for(i = 0, l = kernel.length - 1; i < l; ++i) {

			// Alternate between targets.
			destRT = ((i % 2) === 0) ? renderTargetX : renderTargetY;

			uniforms.kernel.value = kernel[i];
			uniforms.inputBuffer.value = lastRT.texture;
			renderer.setRenderTarget(destRT);
			renderer.render(scene, camera);

			lastRT = destRT;

		}

		if(this.dithering) {

			material = this.ditheredConvolutionMaterial;
			uniforms = material.uniforms;
			this.setFullscreenMaterial(material);

		}

		uniforms.kernel.value = kernel[i];
		uniforms.inputBuffer.value = lastRT.texture;
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
		const aspect = width / height;

		this.originalSize.set(width, height);

		if(resolution.x !== AUTO_SIZE && resolution.y !== AUTO_SIZE) {

			width = Math.max(1, resolution.x);
			height = Math.max(1, resolution.y);

		} else if(resolution.x !== AUTO_SIZE) {

			width = Math.max(1, resolution.x);
			height = Math.round(Math.max(1, resolution.y) / aspect);

		} else if(resolution.y !== AUTO_SIZE) {

			width = Math.round(Math.max(1, resolution.y) * aspect);
			height = Math.max(1, resolution.y);

		} else {

			width = Math.max(1, Math.round(width * this.resolutionScale));
			height = Math.max(1, Math.round(height * this.resolutionScale));

		}

		this.renderTargetX.setSize(width, height);
		this.renderTargetY.setSize(width, height);

		this.convolutionMaterial.setTexelSize(1.0 / width, 1.0 / height);
		this.ditheredConvolutionMaterial.setTexelSize(1.0 / width, 1.0 / height);

	}

	/**
	 * Performs initialization tasks.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 */

	initialize(renderer, alpha) {

		if(!alpha) {

			this.renderTargetX.texture.format = RGBFormat;
			this.renderTargetY.texture.format = RGBFormat;

		}

	}

	/**
	 * An auto sizing flag that can be used for the render {@link BlurPass.width}
	 * and {@link BlurPass.height}.
	 *
	 * It's recommended to set the height or the width to an absolute value for
	 * consistent blur results across different devices and resolutions.
	 *
	 * @type {Number}
	 */

	static get AUTO_SIZE() {

		return AUTO_SIZE;

	}

}
