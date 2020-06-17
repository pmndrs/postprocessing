import { LinearFilter, RGBFormat, Uniform, UnsignedByteType, WebGLRenderTarget } from "three";
import { Resizer } from "../core";
import { KernelSize, LuminanceMaterial } from "../materials";
import { BlurPass, ShaderPass } from "../passes";
import { BlendFunction } from "./blending/BlendFunction.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/bloom/shader.frag";

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
	 * @param {Number} [options.intensity=1.0] - The intensity.
	 * @param {Number} [options.width=Resizer.AUTO_SIZE] - The render width.
	 * @param {Number} [options.height=Resizer.AUTO_SIZE] - The render height.
	 * @param {KernelSize} [options.kernelSize=KernelSize.LARGE] - The blur kernel size.
	 */

	constructor({
		blendFunction = BlendFunction.SCREEN,
		luminanceThreshold = 0.9,
		luminanceSmoothing = 0.025,
		resolutionScale = 0.5,
		intensity = 1.0,
		width = Resizer.AUTO_SIZE,
		height = Resizer.AUTO_SIZE,
		kernelSize = KernelSize.LARGE
	} = {}) {

		super("BloomEffect", fragmentShader, {

			blendFunction,

			uniforms: new Map([
				["texture", new Uniform(null)],
				["intensity", new Uniform(intensity)]
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
		 * @type {BlurPass}
		 */

		this.blurPass = new BlurPass({ resolutionScale, width, height, kernelSize });
		this.blurPass.resolution.resizable = this;

		/**
		 * A luminance shader pass.
		 *
		 * You may disable this pass to deactivate luminance filtering.
		 *
		 * @type {ShaderPass}
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
	 * The resolution of this effect.
	 *
	 * @type {Resizer}
	 */

	get resolution() {

		return this.blurPass.resolution;

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
	 * Indicates whether dithering is enabled.
	 *
	 * @type {Boolean}
	 * @deprecated Set the frameBufferType of the EffectComposer to HalfFloatType instead.
	 */

	get dithering() {

		return this.blurPass.dithering;

	}

	/**
	 * Enables or disables dithering.
	 *
	 * @type {Boolean}
	 * @deprecated Set the frameBufferType of the EffectComposer to HalfFloatType instead.
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
	 * The bloom intensity.
	 *
	 * @type {Number}
	 */

	get intensity() {

		return this.uniforms.get("intensity").value;

	}

	/**
	 * Sets the bloom intensity.
	 *
	 * @type {Number}
	 */

	set intensity(value) {

		this.uniforms.get("intensity").value = value;

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
	 * Updates this effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 */

	update(renderer, inputBuffer, deltaTime) {

		const renderTarget = this.renderTarget;

		if(this.luminancePass.enabled) {

			this.luminancePass.render(renderer, inputBuffer, renderTarget);
			this.blurPass.render(renderer, renderTarget, renderTarget);

		} else {

			this.blurPass.render(renderer, inputBuffer, renderTarget);

		}

	}

	/**
	 * Updates the size of internal render targets.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.blurPass.setSize(width, height);
		this.renderTarget.setSize(this.resolution.width, this.resolution.height);

	}

	/**
	 * Performs initialization tasks.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 * @param {Number} frameBufferType - The type of the main frame buffers.
	 */

	initialize(renderer, alpha, frameBufferType) {

		this.blurPass.initialize(renderer, alpha, frameBufferType);

		if(!alpha && frameBufferType === UnsignedByteType) {

			this.renderTarget.texture.format = RGBFormat;

		}

		if(frameBufferType !== undefined) {

			this.renderTarget.texture.type = frameBufferType;

		}

	}

}
