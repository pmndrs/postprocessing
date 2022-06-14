import { LinearFilter, sRGBEncoding, Uniform, WebGLRenderTarget } from "three";
import { Resolution } from "../core";
import { BlendFunction, KernelSize } from "../enums";
import { KawaseBlurPass, LuminancePass } from "../passes";
import { Effect } from "./Effect";

import fragmentShader from "./glsl/bloom.frag";

/**
 * A bloom effect.
 */

export class BloomEffect extends Effect {

	/**
	 * Constructs a new bloom effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.SCREEN] - The blend function of this effect.
	 * @param {KernelSize} [options.kernelSize=KernelSize.LARGE] - The blur kernel size.
	 * @param {Number} [options.luminanceThreshold=0.9] - The luminance threshold. Raise this value to mask out darker elements in the scene. Range is [0, 1].
	 * @param {Number} [options.luminanceSmoothing=0.025] - Controls the smoothness of the luminance threshold. Range is [0, 1].
	 * @param {Number} [options.intensity=1.0] - The intensity.
	 * @param {Number} [options.resolutionScale=0.5] - The resolution scale.
	 * @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - The horizontal resolution.
	 * @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - The vertical resolution.
	 * @param {Number} [options.width=Resolution.AUTO_SIZE] - Deprecated. Use resolutionX instead.
	 * @param {Number} [options.height=Resolution.AUTO_SIZE] - Deprecated. Use resolutionY instead.
	 */

	constructor({
		blendFunction = BlendFunction.SCREEN,
		kernelSize = KernelSize.LARGE,
		luminanceThreshold = 0.9,
		luminanceSmoothing = 0.025,
		intensity = 1.0,
		resolutionScale = 0.5,
		width = Resolution.AUTO_SIZE,
		height = Resolution.AUTO_SIZE,
		resolutionX = width,
		resolutionY = height
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

		this.renderTarget = new WebGLRenderTarget(1, 1, { depthBuffer: false });
		this.renderTarget.texture.name = "Bloom.Target";
		this.uniforms.get("map").value = this.renderTarget.texture;

		/**
		 * A luminance shader pass.
		 *
		 * This pass can be disabled to skip luminance filtering.
		 *
		 * @type {LuminancePass}
		 * @readonly
		 */

		this.luminancePass = new LuminancePass({
			colorOutput: true
		});

		this.luminanceMaterial.threshold = luminanceThreshold;
		this.luminanceMaterial.smoothing = luminanceSmoothing;

		/**
		 * A blur pass.
		 *
		 * @type {KawaseBlurPass}
		 * @readonly
		 */

		this.blurPass = new KawaseBlurPass({ kernelSize });

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
	 * A texture that contains the intermediate result of this effect.
	 *
	 * @type {Texture}
	 */

	get texture() {

		return this.renderTarget.texture;

	}

	/**
	 * Returns the generated bloom texture.
	 *
	 * @deprecated Use texture instead.
	 * @return {Texture} The texture.
	 */

	getTexture() {

		return this.renderTarget.texture;

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
	 * Returns the blur pass.
	 *
	 * @deprecated Use blurPass instead.
	 * @return {KawaseBlurPass} The blur pass.
	 */

	getBlurPass() {

		return this.blurPass;

	}

	/**
	 * Returns the luminance pass.
	 *
	 * @deprecated Use luminancePass instead.
	 * @return {LuminancePass} The luminance pass.
	 */

	getLuminancePass() {

		return this.luminancePass;

	}

	/**
	 * The luminance material.
	 *
	 * @type {LuminanceMaterial}
	 */

	get luminanceMaterial() {

		return this.luminancePass.fullscreenMaterial;

	}

	/**
	 * Returns the luminance material.
	 *
	 * @deprecated Use luminanceMaterial instead.
	 * @return {LuminanceMaterial} The material.
	 */

	getLuminanceMaterial() {

		return this.luminancePass.fullscreenMaterial;

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
	 * @deprecated Use blurPass.kernelSize instead.
	 */

	get kernelSize() {

		return this.blurPass.kernelSize;

	}

	set kernelSize(value) {

		this.blurPass.kernelSize = value;

	}

	/**
	 * @type {Number}
	 * @deprecated Use luminanceMaterial instead.
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
	 * @deprecated Use intensity instead.
	 * @return {Number} The intensity.
	 */

	getIntensity() {

		return this.intensity;

	}

	/**
	 * Sets the bloom intensity.
	 *
	 * @deprecated Use intensity instead.
	 * @param {Number} value - The intensity.
	 */

	setIntensity(value) {

		this.intensity = value;

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
	 * Updates this effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 */

	update(renderer, inputBuffer, deltaTime) {

		const renderTarget = this.renderTarget;
		const luminancePass = this.luminancePass;

		if(luminancePass.enabled) {

			luminancePass.render(renderer, inputBuffer);
			this.blurPass.render(renderer, luminancePass.renderTarget, renderTarget);

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
		this.blurPass.resolution.copy(resolution);

		// Use the full resolution to reduce shimmering.
		this.luminancePass.setSize(width, height);

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
		this.luminancePass.initialize(renderer, alpha, frameBufferType);

		if(frameBufferType !== undefined) {

			this.renderTarget.texture.type = frameBufferType;

			if(renderer.outputEncoding === sRGBEncoding) {

				this.renderTarget.texture.encoding = sRGBEncoding;

			}

		}

	}

}
