import { Uniform, WebGLRenderTarget } from "three";
import { Resolution } from "../core";
import { SRGBColorSpace } from "../enums/ColorSpace";
import { BlendFunction, KernelSize } from "../enums";
import { KawaseBlurPass, LuminancePass, MipmapBlurPass } from "../passes";
import { getOutputColorSpace, setTextureColorSpace } from "../utils";
import { Effect } from "./Effect";

import fragmentShader from "./glsl/bloom.frag";

/**
 * A bloom effect.
 *
 * Based on an article by Fabrice Piquet:
 * https://www.froyok.fr/blog/2021-12-ue4-custom-bloom/
 */

export class BloomEffect extends Effect {

	/**
	 * Constructs a new bloom effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.SCREEN] - The blend function of this effect.
	 * @param {Number} [options.luminanceThreshold=0.9] - The luminance threshold. Raise this value to mask out darker elements in the scene.
	 * @param {Number} [options.luminanceSmoothing=0.025] - Controls the smoothness of the luminance threshold.
	 * @param {Boolean} [options.mipmapBlur=false] - Enables or disables mipmap blur.
	 * @param {Number} [options.intensity=1.0] - The bloom intensity.
	 * @param {Number} [options.radius=0.85] - The blur radius. Only applies to mipmap blur.
	 * @param {Number} [options.levels=8] - The amount of MIP levels. Only applies to mipmap blur.
	 * @param {KernelSize} [options.kernelSize=KernelSize.LARGE] - Deprecated. Use mipmapBlur instead.
	 * @param {Number} [options.resolutionScale=0.5] - Deprecated. Use mipmapBlur instead.
	 * @param {Number} [options.resolutionX=Resolution.AUTO_SIZE] - Deprecated. Use mipmapBlur instead.
	 * @param {Number} [options.resolutionY=Resolution.AUTO_SIZE] - Deprecated. Use mipmapBlur instead.
	 * @param {Number} [options.width=Resolution.AUTO_SIZE] - Deprecated. Use mipmapBlur instead.
	 * @param {Number} [options.height=Resolution.AUTO_SIZE] - Deprecated. Use mipmapBlur instead.
	 */

	constructor({
		blendFunction = BlendFunction.SCREEN,
		luminanceThreshold = 0.9,
		luminanceSmoothing = 0.025,
		mipmapBlur = false,
		intensity = 1.0,
		radius = 0.85,
		levels = 8,
		kernelSize = KernelSize.LARGE,
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

		/**
		 * A blur pass.
		 *
		 * @type {KawaseBlurPass}
		 * @readonly
		 */

		this.blurPass = new KawaseBlurPass({ kernelSize });

		/**
		 * A luminance pass.
		 *
		 * Disable to skip luminance filtering.
		 *
		 * @type {LuminancePass}
		 * @readonly
		 */

		this.luminancePass = new LuminancePass({ colorOutput: true });
		this.luminanceMaterial.threshold = luminanceThreshold;
		this.luminanceMaterial.smoothing = luminanceSmoothing;

		/**
		 * A mipmap blur pass.
		 *
		 * @type {MipmapBlurPass}
		 * @private
		 */

		this.mipmapBlurPass = new MipmapBlurPass();
		this.mipmapBlurPass.enabled = mipmapBlur;
		this.mipmapBlurPass.radius = radius;
		this.mipmapBlurPass.levels = levels;

		this.uniforms.get("map").value = mipmapBlur ? this.mipmapBlurPass.texture : this.renderTarget.texture;

		/**
		 * The render resolution.
		 *
		 * @type {Resolution}
		 * @readonly
		 * @deprecated
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

		return this.mipmapBlurPass.enabled ? this.mipmapBlurPass.texture : this.renderTarget.texture;

	}

	/**
	 * Returns the generated bloom texture.
	 *
	 * @deprecated Use texture instead.
	 * @return {Texture} The texture.
	 */

	getTexture() {

		return this.texture;

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
	 * @deprecated
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
	 * @deprecated
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
	 * @deprecated
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
	 * @deprecated Use EffectPass.dithering instead.
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
	 * @deprecated
	 */

	get kernelSize() {

		return this.blurPass.kernelSize;

	}

	set kernelSize(value) {

		this.blurPass.kernelSize = value;

	}

	/**
	 * @type {Number}
	 * @deprecated
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
	 * @deprecated
	 */

	getResolutionScale() {

		return this.resolution.scale;

	}

	/**
	 * Sets the resolution scale.
	 *
	 * @param {Number} scale - The new resolution scale.
	 * @deprecated
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

			if(this.mipmapBlurPass.enabled) {

				this.mipmapBlurPass.render(renderer, luminancePass.renderTarget);

			} else {

				this.blurPass.render(renderer, luminancePass.renderTarget, renderTarget);

			}

		} else {

			if(this.mipmapBlurPass.enabled) {

				this.mipmapBlurPass.render(renderer, inputBuffer);

			} else {

				this.blurPass.render(renderer, inputBuffer, renderTarget);

			}

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

		this.luminancePass.setSize(width, height);
		this.mipmapBlurPass.setSize(width, height);

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
		this.mipmapBlurPass.initialize(renderer, alpha, frameBufferType);

		if(frameBufferType !== undefined) {

			this.renderTarget.texture.type = frameBufferType;

			if(getOutputColorSpace(renderer) === SRGBColorSpace) {

				setTextureColorSpace(this.renderTarget.texture, SRGBColorSpace);

			}

		}

	}

}
