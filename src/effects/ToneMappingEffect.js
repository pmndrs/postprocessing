import { LinearFilter, LinearMipMapLinearFilter, LinearMipmapLinearFilter, Uniform, WebGLRenderTarget } from "three";
import { AdaptiveLuminancePass, LuminancePass } from "../passes";
import { BlendFunction } from "./blending/BlendFunction";
import { Effect } from "./Effect";

import fragmentShader from "./glsl/tone-mapping/shader.frag";

/**
 * A tone mapping mode enumeration.
 *
 * @type {Object}
 * @property {Number} REINHARD - Simple Reinhard tone mapping.
 * @property {Number} REINHARD2 - Modified Reinhard tone mapping.
 * @property {Number} REINHARD2_ADAPTIVE - Simulates the optic nerve responding to the amount of light it is receiving.
 * @property {Number} OPTIMIZED_CINEON - Optimized filmic operator by Jim Hejl and Richard Burgess-Dawson.
 * @property {Number} ACES_FILMIC - ACES tone mapping with a scale of 1.0/0.6.
 */

export const ToneMappingMode = {
	REINHARD: 0,
	REINHARD2: 1,
	REINHARD2_ADAPTIVE: 2,
	OPTIMIZED_CINEON: 3,
	ACES_FILMIC: 4
};

/**
 * A tone mapping effect.
 *
 * Note: `ToneMappingMode.REINHARD2_ADAPTIVE` requires support for `EXT_shader_texture_lod` and
 * `EXT_color_buffer_half_float`.
 *
 * Reference:
 * GDC2007 - Wolfgang Engel, Post-Processing Pipeline
 * http://perso.univ-lyon1.fr/jean-claude.iehl/Public/educ/GAMA/2007/gdc07/Post-Processing_Pipeline.pdf
 */

export class ToneMappingEffect extends Effect {

	/**
	 * Constructs a new tone mapping effect.
	 *
	 * The additional parameters only affect the Reinhard2 operator.
	 *
	 * TODO Remove deprecated params and change default mode to ACES_FILMIC and white point to 4.
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
	 * @param {Boolean} [options.adaptive=true] - Deprecated. Use mode instead.
	 * @param {ToneMappingMode} [options.mode=ToneMappingMode.REINHARD2_ADAPTIVE] - The tone mapping mode.
	 * @param {Number} [options.resolution=256] - The resolution of the luminance texture. Must be a power of two.
	 * @param {Number} [options.maxLuminance=16.0] - Deprecated. Same as whitePoint.
	 * @param {Number} [options.whitePoint=16.0] - The white point.
	 * @param {Number} [options.middleGrey=0.6] - The middle grey factor.
	 * @param {Number} [options.minLuminance=0.01] - The minimum luminance. Prevents very high exposure in dark scenes.
	 * @param {Number} [options.averageLuminance=1.0] - The average luminance. Used for the non-adaptive Reinhard operator.
	 * @param {Number} [options.adaptationRate=1.0] - The luminance adaptation rate.
	 */

	constructor({
		blendFunction = BlendFunction.NORMAL,
		adaptive = true,
		mode = adaptive ? ToneMappingMode.REINHARD2_ADAPTIVE : ToneMappingMode.REINHARD2,
		resolution = 256,
		maxLuminance = 16.0,
		whitePoint = maxLuminance,
		middleGrey = 0.6,
		minLuminance = 0.01,
		averageLuminance = 1.0,
		adaptationRate = 1.0
	} = {}) {

		super("ToneMappingEffect", fragmentShader, {
			blendFunction,
			uniforms: new Map([
				["luminanceBuffer", new Uniform(null)],
				["maxLuminance", new Uniform(maxLuminance)], // Unused
				["whitePoint", new Uniform(whitePoint)],
				["middleGrey", new Uniform(middleGrey)],
				["averageLuminance", new Uniform(averageLuminance)]
			])
		});

		/**
		 * The render target for the current luminance.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 * TODO Remove LinearMipMapLinearFilter in next major release.
		 */

		this.renderTargetLuminance = new WebGLRenderTarget(1, 1, {
			minFilter: (LinearMipmapLinearFilter !== undefined) ? LinearMipmapLinearFilter : LinearMipMapLinearFilter,
			magFilter: LinearFilter,
			stencilBuffer: false,
			depthBuffer: false
		});

		this.renderTargetLuminance.texture.name = "Luminance";
		this.renderTargetLuminance.texture.generateMipmaps = true;

		/**
		 * A luminance pass.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.luminancePass = new LuminancePass({
			renderTarget: this.renderTargetLuminance
		});

		/**
		 * An adaptive luminance pass.
		 *
		 * @type {AdaptiveLuminancePass}
		 * @private
		 */

		this.adaptiveLuminancePass = new AdaptiveLuminancePass(this.luminancePass.getTexture(), {
			minLuminance,
			adaptationRate
		});

		this.uniforms.get("luminanceBuffer").value = this.adaptiveLuminancePass.getTexture();

		/**
		 * The current tone mapping mode.
		 *
		 * @type {ToneMappingMode}
		 * @private
		 */

		this.mode = null;

		this.setMode(mode);
		this.setResolution(resolution);

	}

	/**
	 * Returns the current tone mapping mode.
	 *
	 * @return {ToneMappingMode} The tone mapping mode.
	 */

	getMode() {

		return this.mode;

	}

	/**
	 * Sets the tone mapping mode.
	 *
	 * @param {ToneMappingMode} value - The tone mapping mode.
	 */

	setMode(value) {

		const currentMode = this.mode;

		if(currentMode !== value) {

			this.defines.clear();

			// Use one of the built-in tone mapping operators.
			switch(value) {

				case ToneMappingMode.REINHARD:
					this.defines.set("toneMapping(texel)", "ReinhardToneMapping(texel)");
					break;

				case ToneMappingMode.OPTIMIZED_CINEON:
					this.defines.set("toneMapping(texel)", "OptimizedCineonToneMapping(texel)");
					break;

				case ToneMappingMode.ACES_FILMIC:
					this.defines.set("toneMapping(texel)", "ACESFilmicToneMapping(texel)");
					break;

				default:
					this.defines.set("toneMapping(texel)", "texel");
					break;

			}

			// Use a custom Reinhard operator.
			if(value === ToneMappingMode.REINHARD2) {

				this.defines.set("REINHARD2", "1");

			} else if(value === ToneMappingMode.REINHARD2_ADAPTIVE) {

				this.defines.set("REINHARD2", "1");
				this.defines.set("ADAPTIVE", "1");

			}

			this.mode = value;
			this.setChanged();

		}

	}

	/**
	 * Returns the adaptive luminance material.
	 *
	 * @return {AdaptiveLuminanceMaterial} The material.
	 */

	getAdaptiveLuminanceMaterial() {

		return this.adaptiveLuminancePass.getFullscreenMaterial();

	}

	/**
	 * The resolution of the render targets.
	 *
	 * @type {Number}
	 * @deprecated Use getResolution() instead.
	 */

	get resolution() {

		return this.getResolution();

	}

	/**
	 * Sets the resolution of the luminance texture. Must be a power of two.
	 *
	 * @type {Number}
	 * @deprecated Use setResolution() instead.
	 */

	set resolution(value) {

		this.setResolution(value);

	}

	/**
	 * Returns the resolution of the luminance texture.
	 *
	 * @return {Number} The resolution.
	 */

	getResolution() {

		return this.luminancePass.getResolution().getWidth();

	}

	/**
	 * Sets the resolution of the luminance texture. Must be a power of two.
	 *
	 * @param {Number} value - The resolution.
	 */

	setResolution(value) {

		// Round the given value to the next power of two.
		const exponent = Math.max(0, Math.ceil(Math.log2(value)));
		const size = Math.pow(2, exponent);

		this.luminancePass.getResolution().setPreferredSize(size, size);
		this.getAdaptiveLuminanceMaterial().setMipLevel1x1(exponent);

	}

	/**
	 * Indicates whether this pass uses adaptive luminance.
	 *
	 * @type {Boolean}
	 * @deprecated Use getMode() instead.
	 */

	get adaptive() {

		return this.defines.has("ADAPTIVE");

	}

	/**
	 * Enables or disables adaptive luminance.
	 *
	 * @type {Boolean}
	 * @deprecated Uset setMode(ToneMappingMode.REINHARD2_ADAPTIVE) instead.
	 */

	set adaptive(value) {

		this.mode = value ? ToneMappingMode.REINHARD2_ADAPTIVE : ToneMappingMode.REINHARD2;

	}

	/**
	 * The luminance adaptation rate.
	 *
	 * @type {Number}
	 * @deprecated Use getAdaptiveLuminanceMaterial().getAdaptationRate() instead.
	 */

	get adaptationRate() {

		return this.getAdaptiveLuminanceMaterial().getAdaptationRate();

	}

	/**
	 * @type {Number}
	 * @deprecated Use getAdaptiveLuminanceMaterial().setAdaptationRate() instead.
	 */

	set adaptationRate(value) {

		this.getAdaptiveLuminanceMaterial().setAdaptationRate(value);

	}

	/**
	 * @type {Number}
	 * @deprecated
	 */

	get distinction() {

		console.warn(this.name, "distinction was removed.");
		return 1.0;

	}

	/**
	 * @type {Number}
	 * @deprecated
	 */

	set distinction(value) {

		console.warn(this.name, "distinction was removed.");

	}

	/**
	 * Updates this effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {Number} [deltaTime] - The time between the last frame and the current one in seconds.
	 */

	update(renderer, inputBuffer, deltaTime) {

		if(this.mode === ToneMappingMode.REINHARD2_ADAPTIVE) {

			this.luminancePass.render(renderer, inputBuffer);
			this.adaptiveLuminancePass.render(renderer, null, null, deltaTime);

		}

	}

	/**
	 * Performs initialization tasks.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 * @param {Number} frameBufferType - The type of the main frame buffers.
	 */

	initialize(renderer, alpha, frameBufferType) {

		this.adaptiveLuminancePass.initialize(renderer, alpha, frameBufferType);

	}

}
