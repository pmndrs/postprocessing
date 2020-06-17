import { LinearFilter, RGBFormat, UnsignedByteType, WebGLRenderTarget } from "three";
import { ConvolutionMaterial, KernelSize } from "../materials";
import { Resizer } from "../core/Resizer.js";
import { Pass } from "./Pass.js";

/**
 * An efficient, incremental blur pass.
 */

export class BlurPass extends Pass {

	/**
	 * Constructs a new blur pass.
	 *
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.resolutionScale=0.5] - Deprecated. Adjust the height or width instead for consistent results.
	 * @param {Number} [options.width=Resizer.AUTO_SIZE] - The blur render width.
	 * @param {Number} [options.height=Resizer.AUTO_SIZE] - The blur render height.
	 * @param {KernelSize} [options.kernelSize=KernelSize.LARGE] - The blur kernel size.
	 */

	constructor({
		resolutionScale = 0.5,
		width = Resizer.AUTO_SIZE,
		height = Resizer.AUTO_SIZE,
		kernelSize = KernelSize.LARGE
	} = {}) {

		super("BlurPass");

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
		 * A second render target.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetB = this.renderTargetA.clone();
		this.renderTargetB.texture.name = "Blur.Target.B";

		/**
		 * The render resolution.
		 *
		 * It's recommended to set the height or the width to an absolute value for
		 * consistent results across different devices and resolutions.
		 *
		 * @type {Resizer}
		 */

		this.resolution = new Resizer(this, width, height, resolutionScale);

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
		 * @deprecated Set the frameBufferType of the EffectComposer to HalfFloatType instead.
		 */

		this.dithering = false;

		this.kernelSize = kernelSize;

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
	 * @deprecated Use resolution.width instead.
	 */

	set width(value) {

		this.resolution.width = value;

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
	 * @deprecated Use resolution.height instead.
	 */

	set height(value) {

		this.resolution.height = value;

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
	 * Returns the current resolution scale.
	 *
	 * @return {Number} The resolution scale.
	 * @deprecated Adjust the fixed resolution width or height instead.
	 */

	getResolutionScale() {

		return this.resolution.scale;

	}

	/**
	 * Sets the resolution scale.
	 *
	 * @param {Number} scale - The new resolution scale.
	 * @deprecated Adjust the fixed resolution width or height instead.
	 */

	setResolutionScale(scale) {

		this.resolution.scale = scale;

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

		const renderTargetA = this.renderTargetA;
		const renderTargetB = this.renderTargetB;

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
			destRT = ((i & 1) === 0) ? renderTargetA : renderTargetB;

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
		resolution.base.set(width, height);

		const w = resolution.width;
		const h = resolution.height;

		this.renderTargetA.setSize(w, h);
		this.renderTargetB.setSize(w, h);

		this.convolutionMaterial.setTexelSize(1.0 / w, 1.0 / h);
		this.ditheredConvolutionMaterial.setTexelSize(1.0 / w, 1.0 / h);

	}

	/**
	 * Performs initialization tasks.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 * @param {Number} frameBufferType - The type of the main frame buffers.
	 */

	initialize(renderer, alpha, frameBufferType) {

		if(!alpha && frameBufferType === UnsignedByteType) {

			this.renderTargetA.texture.format = RGBFormat;
			this.renderTargetB.texture.format = RGBFormat;

		}

		if(frameBufferType !== undefined) {

			this.renderTargetA.texture.type = frameBufferType;
			this.renderTargetB.texture.type = frameBufferType;

		}

	}

	/**
	 * An auto sizing flag.
	 *
	 * @type {Number}
	 * @deprecated Use {@link Resizer.AUTO_SIZE} instead.
	 */

	static get AUTO_SIZE() {

		return Resizer.AUTO_SIZE;

	}

}
