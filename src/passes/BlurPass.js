import { LinearFilter, RGBFormat, WebGLRenderTarget } from "three";
import { ConvolutionMaterial, KernelSize } from "../materials";
import { Pass } from "./Pass.js";

/**
 * A blur pass.
 */

export class BlurPass extends Pass {

	/**
	 * Constructs a new blur pass.
	 *
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.resolutionScale=0.5] - The render texture resolution scale, relative to the screen render size.
	 * @param {Number} [options.kernelSize=KernelSize.LARGE] - The blur kernel size.
	 */

	constructor(options = {}) {

		super();

		/**
		 * The name of this pass.
		 */

		this.name = "BlurPass";

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
		this.renderTargetX.texture.generateMipmaps = false;

		/**
		 * A second render target.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetY = this.renderTargetX.clone();

		this.renderTargetY.texture.name = "Blur.TargetY";

		/**
		 * The resolution scale.
		 *
		 * You need to call {@link EffectComposer#setSize} after changing this
		 * value.
		 *
		 * @type {Number}
		 */

		this.resolutionScale = (options.resolutionScale !== undefined) ? options.resolutionScale : 0.5;

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

		this.kernelSize = options.kernelSize;

	}

	/**
	 * The absolute width of the internal render targets.
	 *
	 * @type {Number}
	 */

	get width() {

		return this.renderTargetX.width;

	}

	/**
	 * The absolute height of the internal render targets.
	 *
	 * @type {Number}
	 */

	get height() {

		return this.renderTargetX.height;

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
	 * @type {KernelSize}
	 */

	set kernelSize(value = KernelSize.LARGE) {

		this.convolutionMaterial.kernelSize = value;
		this.ditheredConvolutionMaterial.kernelSize = value;

	}

	/**
	 * Blurs the read buffer.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} readBuffer - The read buffer.
	 * @param {WebGLRenderTarget} writeBuffer - The write buffer.
	 */

	render(renderer, readBuffer, writeBuffer) {

		const scene = this.scene;
		const camera = this.camera;

		const renderTargetX = this.renderTargetX;
		const renderTargetY = this.renderTargetY;

		let material = this.convolutionMaterial;
		let uniforms = material.uniforms;
		const kernel = material.getKernel();

		let lastRT = readBuffer;
		let destRT;
		let i, l;

		this.quad.material = material;

		// Apply the multi-pass blur.
		for(i = 0, l = kernel.length - 1; i < l; ++i) {

			// Alternate between targets.
			destRT = ((i % 2) === 0) ? renderTargetX : renderTargetY;

			uniforms.kernel.value = kernel[i];
			uniforms.tDiffuse.value = lastRT.texture;
			renderer.render(scene, camera, destRT);

			lastRT = destRT;

		}

		if(this.dithering) {

			material = this.ditheredConvolutionMaterial;
			uniforms = material.uniforms;
			this.quad.material = material;

		}

		uniforms.kernel.value = kernel[i];
		uniforms.tDiffuse.value = lastRT.texture;
		renderer.render(scene, camera, this.renderToScreen ? null : writeBuffer);

	}

	/**
	 * Adjusts the format of the render targets.
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
	 * Updates this pass with the renderer's size.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		width = Math.max(1, Math.floor(width * this.resolutionScale));
		height = Math.max(1, Math.floor(height * this.resolutionScale));

		this.renderTargetX.setSize(width, height);
		this.renderTargetY.setSize(width, height);

		this.convolutionMaterial.setTexelSize(1.0 / width, 1.0 / height);
		this.ditheredConvolutionMaterial.setTexelSize(1.0 / width, 1.0 / height);

	}

}
