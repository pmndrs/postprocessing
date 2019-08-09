import {
	LinearFilter,
	RGBFormat,
	Uniform,
	WebGLRenderTarget
} from "three";

import { KernelSize, LuminanceMaterial } from "../materials";
import { BlurPass, ShaderPass } from "../passes";
import { BlendFunction } from "./blending/BlendFunction.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/texture/shader.frag";

/**
 * A bloom effect.
 *
 * This effect uses the fast Kawase convolution technique and a luminance filter
 * to blur bright highlights.
 */

export class BloomEffect extends Effect {

	/**
	 * Constructs a new bloom effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.SCREEN] - The blend function of this effect.
	 * @param {Number} [options.luminanceThreshold=0.9] - The luminance threshold. Raise this value to mask out darker elements in the scene. Range is [0, 1].
	 * @param {Number} [options.luminanceSmoothing=0.025] - Controls the smoothness of the luminance threshold. Range is [0, 1].
	 * @param {Number} [options.resolutionScale=0.5] - Deprecated. Use height or width instead.
	 * @param {Number} [options.width=BlurPass.AUTO_SIZE] - The render width.
	 * @param {Number} [options.height=BlurPass.AUTO_SIZE] - The render height.
	 * @param {KernelSize} [options.kernelSize=KernelSize.LARGE] - The blur kernel size.
	 */

	constructor({
		blendFunction = BlendFunction.SCREEN,
		luminanceThreshold = 0.9,
		luminanceSmoothing = 0.025,
		resolutionScale = 0.5,
		width = BlurPass.AUTO_SIZE,
		height = BlurPass.AUTO_SIZE,
		kernelSize = KernelSize.LARGE
	} = {}) {

		super("BloomEffect", fragmentShader, {

			blendFunction,

			uniforms: new Map([
				["texture", new Uniform(null)]
			])

		});

		/**
		 * A render target.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTarget = new WebGLRenderTarget(1, 1, {
			minFilter: LinearFilter,
			magFilter: LinearFilter,
			stencilBuffer: false,
			depthBuffer: false
		});

		this.renderTarget.texture.name = "Bloom.Target";
		this.renderTarget.texture.generateMipmaps = false;

		this.uniforms.get("texture").value = this.renderTarget.texture;

		/**
		 * A blur pass.
		 *
		 * Do not adjust the width or height of this pass directly. Use
		 * {@link width} or {@link height} instead.
		 *
		 * @type {BlurPass}
		 */

		this.blurPass = new BlurPass({ resolutionScale, width, height, kernelSize });

		/**
		 * A luminance shader pass.
		 *
		 * You may disable this pass to deactivate luminance filtering.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.luminancePass = new ShaderPass(new LuminanceMaterial(true));

		this.luminanceMaterial.threshold = luminanceThreshold;
		this.luminanceMaterial.smoothing = luminanceSmoothing;

	}

	/**
	 * A texture that contains the intermediate result of this effect.
	 *
	 * This texture will be applied to the scene colors unless the blend function
	 * is set to `SKIP`.
	 *
	 * @type {Texture}
	 */

	get texture() {

		return this.renderTarget.texture;

	}

	/**
	 * The luminance material.
	 *
	 * @type {LuminanceMaterial}
	 */

	get luminanceMaterial() {

		return this.luminancePass.getFullscreenMaterial();

	}

	/**
	 * The current width of the internal render targets.
	 *
	 * @type {Number}
	 */

	get width() {

		return this.blurPass.width;

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

		const blurPass = this.blurPass;
		blurPass.width = value;
		this.renderTarget.setSize(blurPass.width, blurPass.height);

	}

	/**
	 * The current height of the internal render targets.
	 *
	 * @type {Number}
	 */

	get height() {

		return this.blurPass.height;

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

		const blurPass = this.blurPass;
		blurPass.height = value;
		this.renderTarget.setSize(blurPass.width, blurPass.height);

	}

	/**
	 * Indicates whether dithering is enabled.
	 *
	 * @type {Boolean}
	 * @deprecated Use blurPass.dithering instead.
	 */

	get dithering() {

		return this.blurPass.dithering;

	}

	/**
	 * Enables or disables dithering.
	 *
	 * @type {Boolean}
	 * @deprecated Use blurPass.dithering instead.
	 */

	set dithering(value) {

		this.blurPass.dithering = value;

	}

	/**
	 * The blur kernel size.
	 *
	 * @type {KernelSize}
	 * @deprecated Use blurPass.kernelSize instead.
	 */

	get kernelSize() {

		return this.blurPass.kernelSize;

	}

	/**
	 * @type {KernelSize}
	 * @deprecated Use blurPass.kernelSize instead.
	 */

	set kernelSize(value) {

		this.blurPass.kernelSize = value;

	}

	/**
	 * @type {Number}
	 * @deprecated Use luminanceMaterial.threshold and luminanceMaterial.smoothing instead.
	 */

	get distinction() {

		console.warn(this.name, "The distinction field has been removed, use luminanceMaterial.threshold and luminanceMaterial.smoothing instead.");

		return 1.0;

	}

	/**
	 * @type {Number}
	 * @deprecated Use luminanceMaterial.threshold and luminanceMaterial.smoothing instead.
	 */

	set distinction(value) {

		console.warn(this.name, "The distinction field has been removed, use luminanceMaterial.threshold and luminanceMaterial.smoothing instead.");

	}

	/**
	 * Returns the current resolution scale.
	 *
	 * @return {Number} The resolution scale.
	 * @deprecated Adjust the width or height instead.
	 */

	getResolutionScale() {

		return this.blurPass.getResolutionScale();

	}

	/**
	 * Sets the resolution scale.
	 *
	 * @param {Number} scale - The new resolution scale.
	 * @deprecated Adjust the width or height instead.
	 */

	setResolutionScale(scale) {

		const blurPass = this.blurPass;
		blurPass.setResolutionScale(scale);
		this.renderTarget.setSize(blurPass.width, blurPass.height);

	}

	/**
	 * Updates this effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 */

	update(renderer, inputBuffer, deltaTime) {

		const renderTarget = this.renderTarget;

		this.luminancePass.render(renderer, inputBuffer, renderTarget);
		this.blurPass.render(renderer, renderTarget, renderTarget);

	}

	/**
	 * Updates the size of internal render targets.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		const blurPass = this.blurPass;
		blurPass.setSize(width, height);
		this.renderTarget.setSize(blurPass.width, blurPass.height);

	}

	/**
	 * Performs initialization tasks.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 */

	initialize(renderer, alpha) {

		this.blurPass.initialize(renderer, alpha);

		if(!alpha) {

			this.renderTarget.texture.format = RGBFormat;

		}

	}

}
