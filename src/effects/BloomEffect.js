import { LinearFilter, sRGBEncoding, Uniform, WebGLRenderTarget } from "three";
import { KernelSize, Resolution } from "../core";
import { KawaseBlurPass, LuminancePass } from "../passes";
import { BlendFunction } from "./blending/BlendFunction";
import { Effect } from "./Effect";

import fragmentShader from "./glsl/bloom/shader.frag";

/**
 * A bloom effect.
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
	 * @param {Number} [options.width=Resolution.AUTO_SIZE] - The render width.
	 * @param {Number} [options.height=Resolution.AUTO_SIZE] - The render height.
	 * @param {KernelSize} [options.kernelSize=KernelSize.LARGE] - The blur kernel size.
	 */

	constructor({
		blendFunction = BlendFunction.SCREEN,
		luminanceThreshold = 0.9,
		luminanceSmoothing = 0.025,
		resolutionScale = 0.5,
		intensity = 1.0,
		width = Resolution.AUTO_SIZE,
		height = Resolution.AUTO_SIZE,
		kernelSize = KernelSize.LARGE
	} = {}) {

		super("BloomEffect", fragmentShader, {
			blendFunction,
			uniforms: new Map([
				["map", new Uniform(null)],
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
		this.uniforms.get("map").value = this.renderTarget.texture;

		/**
		 * A luminance shader pass.
		 *
		 * This pass can be disabled to skip luminance filtering.
		 *
		 * @type {LuminancePass}
		 * @deprecated Use getLuminancePass() instead.
		 */

		this.luminancePass = new LuminancePass({
			renderTarget: this.renderTarget,
			colorOutput: true
		});

		this.luminanceMaterial.threshold = luminanceThreshold;
		this.luminanceMaterial.smoothingFactor = luminanceSmoothing;

		/**
		 * A blur pass.
		 *
		 * @type {KawaseBlurPass}
		 * @deprecated Use getBlurPass() instead.
		 */

		this.blurPass = new KawaseBlurPass({ resolutionScale, width, height, kernelSize });

		const resolution = this.blurPass.getResolution();
		resolution.addEventListener("change", (e) => this.setSize(resolution.baseWidth, resolution.baseHeight));

	}

	/**
	 * A texture that contains the intermediate result of this effect.
	 *
	 * @type {Texture}
	 * @deprecated Use getTexture() instead.
	 */

	get texture() {

		return this.renderTarget.texture;

	}

	/**
	 * Returns the generated bloom texture.
	 *
	 * @return {Texture} The texture.
	 */

	getTexture() {

		return this.renderTarget.texture;

	}

	/**
	 * The resolution of this effect.
	 *
	 * @type {Resolution}
	 * @deprecated Use getResolution() instead.
	 */

	get resolution() {

		return this.blurPass.resolution;

	}

	/**
	 * Returns the resolution settings.
	 *
	 * @return {Resolution} The resolution.
	 */

	getResolution() {

		return this.blurPass.resolution;

	}

	/**
	 * Returns the blur pass.
	 *
	 * @return {KawaseBlurPass} The blur pass.
	 */

	getBlurPass() {

		return this.blurPass;

	}

	/**
	 * Returns the luminance pass.
	 *
	 * @return {LuminancePass} The luminance pass.
	 */

	getLuminancePass() {

		return this.luminancePass;

	}

	/**
	 * The luminance material.
	 *
	 * @type {LuminanceMaterial}
	 * @deprecated Use getLuminanceMaterial() instead.
	 */

	get luminanceMaterial() {

		return this.luminancePass.fullscreenMaterial;

	}

	/**
	 * Returns the luminance material.
	 *
	 * @return {LuminanceMaterial} The material.
	 */

	getLuminanceMaterial() {

		return this.luminancePass.fullscreenMaterial;

	}

	/**
	 * The current width of the internal render targets.
	 *
	 * @type {Number}
	 * @deprecated Use getResolution().getWidth() instead.
	 */

	get width() {

		return this.resolution.width;

	}

	set width(value) {

		this.resolution.preferredWidth = value;

	}

	/**
	 * The current height of the internal render targets.
	 *
	 * @type {Number}
	 * @deprecated Use getResolution().getHeight() instead.
	 */

	get height() {

		return this.resolution.height;

	}

	set height(value) {

		this.resolution.preferredHeight = value;

	}

	/**
	 * Indicates whether dithering is enabled.
	 *
	 * @type {Boolean}
	 * @deprecated Use EffectPass.fullscreenMaterial.dithering instead.
	 */

	get dithering() {

		return this.blurPass.dithering;

	}

	set dithering(value) {

		this.blurPass.dithering = value;

	}

	/**
	 * The blur kernel size.
	 *
	 * @type {KernelSize}
	 * @deprecated Use getBlurPass().getKernelSize() instead.
	 */

	get kernelSize() {

		return this.blurPass.kernelSize;

	}

	set kernelSize(value) {

		this.blurPass.kernelSize = value;

	}

	/**
	 * @type {Number}
	 * @deprecated Use getLuminanceMaterial().getThreshold() and ...getSmoothingFactor() instead.
	 */

	get distinction() {

		console.warn(this.name, "distinction was removed");
		return 1.0;

	}

	set distinction(value) {

		console.warn(this.name, "distinction was removed");

	}

	/**
	 * The bloom intensity.
	 *
	 * @type {Number}
	 * @deprecated Use getIntensity() instead.
	 */

	get intensity() {

		return this.uniforms.get("intensity").value;

	}

	set intensity(value) {

		this.uniforms.get("intensity").value = value;

	}

	/**
	 * The bloom intensity.
	 *
	 * @return {Number} The intensity.
	 */

	getIntensity() {

		return this.intensity;

	}

	/**
	 * Sets the bloom intensity.
	 *
	 * @param {Number} value - The intensity.
	 */

	setIntensity(value) {

		this.intensity = value;

	}

	/**
	 * Returns the current resolution scale.
	 *
	 * @return {Number} The resolution scale.
	 * @deprecated Use getResolution().setPreferredWidth() or getResolution().setPreferredHeight() instead.
	 */

	getResolutionScale() {

		return this.resolution.scale;

	}

	/**
	 * Sets the resolution scale.
	 *
	 * @param {Number} scale - The new resolution scale.
	 * @deprecated Use getResolution().setPreferredWidth() or getResolution().setPreferredHeight() instead.
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

		const resolution = this.resolution;
		resolution.setBaseSize(width, height);
		this.renderTarget.setSize(resolution.width, resolution.height);
		this.luminancePass.resolution.copy(resolution);

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

		if(frameBufferType !== undefined) {

			this.renderTarget.texture.type = frameBufferType;

			if(renderer.outputEncoding === sRGBEncoding) {

				this.renderTarget.texture.encoding = sRGBEncoding;

			}

		}

	}

}
