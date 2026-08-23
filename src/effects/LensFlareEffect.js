import { SRGBColorSpace, Uniform, WebGLRenderTarget } from "three";
import { Resolution } from "../core/Resolution.js";
import { BlendFunction } from "../enums/BlendFunction.js";
import { EffectAttribute } from "../enums/EffectAttribute.js";
import { KernelSize } from "../enums/KernelSize.js";
import { DownsampleThresholdMaterial } from "../materials/DownsampleThresholdMaterial.js";
import { LensFlareFeaturesMaterial } from "../materials/LensFlareFeaturesMaterial.js";
import { KawaseBlurPass } from "../passes/KawaseBlurPass.js";
import { MipmapBlurPass } from "../passes/MipmapBlurPass.js";
import { ShaderPass } from "../passes/ShaderPass.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/lens-flare.frag";

/**
 * A lens flare effect.
 *
 * Based on https://www.froyok.fr/blog/2021-09-ue4-custom-lens-flare/
 */

export class LensFlareEffect extends Effect {

	/**
	 * Constructs a new lens flare effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.intensity] - The intensity of the lens flare.
	 */

	constructor({
		blendFunction = BlendFunction.SRC,
		intensity = 1.0,
		resolutionScale = 0.5,
		width = Resolution.AUTO_SIZE,
		height = Resolution.AUTO_SIZE,
		resolutionX = width,
		resolutionY = height
	} = {}) {

		super("LensFlareEffect", fragmentShader, {
			blendFunction,
			attributes: EffectAttribute.CONVOLUTION,
			uniforms: new Map([
				["bloomBuffer", new Uniform(null)],
				["featuresBuffer", new Uniform(null)],
				["intensity", new Uniform(intensity)]
			])
		});

		/**
		 * A render target for intermediate results.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTarget1 = new WebGLRenderTarget(1, 1, { depthBuffer: false });
		this.renderTarget1.texture.name = "LensFlare.Target1";

		/**
		 * A render target for intermediate results.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTarget2 = new WebGLRenderTarget(1, 1, { depthBuffer: false });
		this.renderTarget2.texture.name = "LensFlare.Target2";

		/**
 		 * A downsample threshold pass.
		 *
		 * @type {ShaderPass}
		 * @readonly
		 */

		const downsampleMaterial = new DownsampleThresholdMaterial();
		this.downsamplePass = new ShaderPass(downsampleMaterial);

		/**
		 * This pass blurs the input buffer to create non-starburst glare (bloom).
		 *
		 * @type {MipmapBlurPass}
		 * @readonly
		 */

		this.blurPass = new MipmapBlurPass();
		this.blurPass.levels = 8;
		this.uniforms.get("bloomBuffer").value = this.blurPass.texture;

		/**
		 * This pass blurs the input buffer of the lens flare features.
		 *
		 * @type {KawaseBlurPass}
		 * @readonly
		 */

		this.featuresBlurPass = new KawaseBlurPass({ kernelSize: KernelSize.SMALL });
		this.uniforms.get("featuresBuffer").value = this.renderTarget1.texture;

		/**
		 * A lens flare features pass.
		 *
		 * @type {ShaderPass}
		 * @readonly
		 */

		const featuresMaterial = new LensFlareFeaturesMaterial();
		this.featuresPass = new ShaderPass(featuresMaterial);

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
	 * The intensity of the lens flare.
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
	 * Updates this effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 */

	update(renderer, inputBuffer, deltaTime) {

		const renderTarget1 = this.renderTarget1;
		const renderTarget2 = this.renderTarget2;

		this.downsamplePass.render(renderer, inputBuffer, renderTarget1);
		this.blurPass.render(renderer, renderTarget1, null);
		this.featuresBlurPass.render(renderer, renderTarget1, renderTarget2);
		this.featuresPass.render(renderer, renderTarget2, renderTarget1);

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
		const w = resolution.width, h = resolution.height;

		this.renderTarget1.setSize(w, h);
		this.renderTarget2.setSize(w, h);
		this.downsamplePass.fullscreenMaterial.setSize(w, h);
		this.blurPass.setSize(w, h);
		this.featuresBlurPass.setSize(w, h);
		this.featuresPass.fullscreenMaterial.setSize(w, h);

	}

	/**
	 * Performs initialization tasks.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 * @param {Number} frameBufferType - The type of the main frame buffers.
	 */

	initialize(renderer, alpha, frameBufferType) {

		this.downsamplePass.initialize(renderer, alpha, frameBufferType);
		this.blurPass.initialize(renderer, alpha, frameBufferType);
		this.featuresBlurPass.initialize(renderer, alpha, frameBufferType);
		this.featuresPass.initialize(renderer, alpha, frameBufferType);

		if(frameBufferType !== undefined) {

			this.renderTarget1.texture.type = frameBufferType;
			this.renderTarget2.texture.type = frameBufferType;

			if(renderer !== null && renderer.outputColorSpace === SRGBColorSpace) {

				this.renderTarget1.texture.colorSpace = SRGBColorSpace;
				this.renderTarget2.texture.colorSpace = SRGBColorSpace;

			}

		}

	}

}
