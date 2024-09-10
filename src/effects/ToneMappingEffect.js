import { LinearMipmapLinearFilter, REVISION, Uniform, WebGLRenderTarget } from "three";
import { AdaptiveLuminancePass } from "../passes/AdaptiveLuminancePass.js";
import { LuminancePass } from "../passes/LuminancePass.js";
import { BlendFunction } from "../enums/BlendFunction.js";
import { ToneMappingMode } from "../enums/ToneMappingMode.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/tone-mapping.frag";

/**
 * A tone mapping effect.
 *
 * Note: `ToneMappingMode.REINHARD2_ADAPTIVE` requires support for `EXT_shader_texture_lod`.
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
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.SRC] - The blend function of this effect.
	 * @param {Boolean} [options.adaptive=false] - Deprecated. Use mode instead.
	 * @param {ToneMappingMode} [options.mode=ToneMappingMode.AGX] - The tone mapping mode.
	 * @param {Number} [options.resolution=256] - The resolution of the luminance texture. Must be a power of two.
	 * @param {Number} [options.maxLuminance=4.0] - Deprecated. Same as whitePoint.
	 * @param {Number} [options.whitePoint=4.0] - The white point.
	 * @param {Number} [options.middleGrey=0.6] - The middle grey factor.
	 * @param {Number} [options.minLuminance=0.01] - The minimum luminance. Prevents very high exposure in dark scenes.
	 * @param {Number} [options.averageLuminance=1.0] - The average luminance. Used for the non-adaptive Reinhard operator.
	 * @param {Number} [options.adaptationRate=1.0] - The luminance adaptation rate.
	 */

	constructor({
		blendFunction = BlendFunction.SRC,
		adaptive = false,
		mode = adaptive ? ToneMappingMode.REINHARD2_ADAPTIVE : ToneMappingMode.AGX,
		resolution = 256,
		maxLuminance = 4.0,
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
		 */

		this.renderTargetLuminance = new WebGLRenderTarget(1, 1, {
			minFilter: LinearMipmapLinearFilter,
			depthBuffer: false
		});

		this.renderTargetLuminance.texture.generateMipmaps = true;
		this.renderTargetLuminance.texture.name = "Luminance";

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

		this.adaptiveLuminancePass = new AdaptiveLuminancePass(this.luminancePass.texture, {
			minLuminance,
			adaptationRate
		});

		this.uniforms.get("luminanceBuffer").value = this.adaptiveLuminancePass.texture;

		this.resolution = resolution;
		this.mode = mode;

	}

	/**
	 * The tone mapping mode.
	 *
	 * @type {ToneMappingMode}
	 */

	get mode() {

		return Number(this.defines.get("TONE_MAPPING_MODE"));

	}

	set mode(value) {

		if(this.mode === value) {

			return;

		}

		const revision = REVISION.replace(/\D+/g, "");
		const cineonToneMapping = (revision >= 168) ? "CineonToneMapping(texel)" : "OptimizedCineonToneMapping(texel)";

		this.defines.clear();
		this.defines.set("TONE_MAPPING_MODE", value.toFixed(0));

		// Use one of the built-in tone mapping operators.
		switch(value) {

			case ToneMappingMode.LINEAR:
				this.defines.set("toneMapping(texel)", "LinearToneMapping(texel)");
				break;

			case ToneMappingMode.REINHARD:
				this.defines.set("toneMapping(texel)", "ReinhardToneMapping(texel)");
				break;

			case ToneMappingMode.CINEON:
			case ToneMappingMode.OPTIMIZED_CINEON:
				this.defines.set("toneMapping(texel)", cineonToneMapping);
				break;

			case ToneMappingMode.ACES_FILMIC:
				this.defines.set("toneMapping(texel)", "ACESFilmicToneMapping(texel)");
				break;

			case ToneMappingMode.AGX:
				this.defines.set("toneMapping(texel)", "AgXToneMapping(texel)");
				break;

			case ToneMappingMode.NEUTRAL:
				this.defines.set("toneMapping(texel)", "NeutralToneMapping(texel)");
				break;

			default:
				this.defines.set("toneMapping(texel)", "texel");
				break;

		}

		this.adaptiveLuminancePass.enabled = (value === ToneMappingMode.REINHARD2_ADAPTIVE);
		this.setChanged();

	}

	/**
	 * Returns the current tone mapping mode.
	 *
	 * @deprecated Use mode instead.
	 * @return {ToneMappingMode} The tone mapping mode.
	 */

	getMode() {

		return this.mode;

	}

	/**
	 * Sets the tone mapping mode.
	 *
	 * @deprecated Use mode instead.
	 * @param {ToneMappingMode} value - The tone mapping mode.
	 */

	setMode(value) {

		this.mode = value;

	}

	/**
	 * The white point. Default is `4.0`.
	 *
	 * Only applies to Reinhard2 (Modified & Adaptive).
	 *
	 * @type {Number}
	 */

	get whitePoint() {

		return this.uniforms.get("whitePoint").value;

	}

	set whitePoint(value) {

		this.uniforms.get("whitePoint").value = value;

	}

	/**
	 * The middle grey factor. Default is `0.6`.
	 *
	 * Only applies to Reinhard2 (Modified & Adaptive).
	 *
	 * @type {Number}
	 */

	get middleGrey() {

		return this.uniforms.get("middleGrey").value;

	}

	set middleGrey(value) {

		this.uniforms.get("middleGrey").value = value;

	}

	/**
	 * The average luminance.
	 *
	 * Only applies to Reinhard2 (Modified).
	 *
	 * @type {Number}
	 */

	get averageLuminance() {

		return this.uniforms.get("averageLuminance").value;

	}

	set averageLuminance(value) {

		this.uniforms.get("averageLuminance").value = value;

	}

	/**
	 * The adaptive luminance material.
	 *
	 * @type {AdaptiveLuminanceMaterial}
	 */

	get adaptiveLuminanceMaterial() {

		return this.adaptiveLuminancePass.fullscreenMaterial;

	}

	/**
	 * Returns the adaptive luminance material.
	 *
	 * @deprecated Use adaptiveLuminanceMaterial instead.
	 * @return {AdaptiveLuminanceMaterial} The material.
	 */

	getAdaptiveLuminanceMaterial() {

		return this.adaptiveLuminanceMaterial;

	}

	/**
	 * The resolution of the luminance texture. Must be a power of two.
	 *
	 * @type {Number}
	 */

	get resolution() {

		return this.luminancePass.resolution.width;

	}

	set resolution(value) {

		// Round the given value to the next power of two.
		const exponent = Math.max(0, Math.ceil(Math.log2(value)));
		const size = Math.pow(2, exponent);

		this.luminancePass.resolution.setPreferredSize(size, size);
		this.adaptiveLuminanceMaterial.mipLevel1x1 = exponent;

	}

	/**
	 * Returns the resolution of the luminance texture.
	 *
	 * @deprecated Use resolution instead.
	 * @return {Number} The resolution.
	 */

	getResolution() {

		return this.resolution;

	}

	/**
	 * Sets the resolution of the luminance texture. Must be a power of two.
	 *
	 * @deprecated Use resolution instead.
	 * @param {Number} value - The resolution.
	 */

	setResolution(value) {

		this.resolution = value;

	}

	/**
	 * Indicates whether this pass uses adaptive luminance.
	 *
	 * @type {Boolean}
	 * @deprecated Use mode instead.
	 */

	get adaptive() {

		return (this.mode === ToneMappingMode.REINHARD2_ADAPTIVE);

	}

	set adaptive(value) {

		this.mode = value ? ToneMappingMode.REINHARD2_ADAPTIVE : ToneMappingMode.REINHARD2;

	}

	/**
	 * The luminance adaptation rate.
	 *
	 * @type {Number}
	 * @deprecated Use adaptiveLuminanceMaterial.adaptationRate instead.
	 */

	get adaptationRate() {

		return this.adaptiveLuminanceMaterial.adaptationRate;

	}

	set adaptationRate(value) {

		this.adaptiveLuminanceMaterial.adaptationRate = value;

	}

	/**
	 * @type {Number}
	 * @deprecated
	 */

	get distinction() {

		console.warn(this.name, "distinction was removed.");
		return 1.0;

	}

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

		if(this.adaptiveLuminancePass.enabled) {

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
