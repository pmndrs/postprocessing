import {
	Color,
	LinearFilter,
	LinearMipMapLinearFilter,
	RGBFormat,
	Uniform,
	WebGLRenderTarget
} from "three";

import { AdaptiveLuminanceMaterial, LuminanceMaterial } from "../materials";
import { ClearPass, SavePass, ShaderPass } from "../passes";
import { BlendFunction } from "./blending/BlendFunction.js";
import { Effect } from "./Effect.js";

import fragment from "./glsl/tone-mapping/shader.frag";

/**
 * A tone mapping effect that supports adaptive luminosity.
 *
 * If adaptivity is enabled, this effect generates a texture that represents the
 * luminosity of the current scene and adjusts it over time to simulate the
 * optic nerve responding to the amount of light it is receiving.
 *
 * Reference:
 *  GDC2007 - Wolfgang Engel, Post-Processing Pipeline
 *  http://perso.univ-lyon1.fr/jean-claude.iehl/Public/educ/GAMA/2007/gdc07/Post-Processing_Pipeline.pdf
 */

export class ToneMappingEffect extends Effect {

	/**
	 * Constructs a new tone mapping effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
	 * @param {Boolean} [options.adaptive=true] - Whether the tone mapping should use an adaptive luminance map.
	 * @param {Number} [options.resolution=256] - The render texture resolution of the luminance map.
	 * @param {Number} [options.distinction=1.0] - A luminance distinction factor.
	 * @param {Number} [options.middleGrey=0.6] - The middle grey factor.
	 * @param {Number} [options.maxLuminance=16.0] - The maximum luminance.
	 * @param {Number} [options.averageLuminance=1.0] - The average luminance.
	 * @param {Number} [options.adaptationRate=1.0] - The luminance adaptation rate.
	 */

	constructor(options = {}) {

		const settings = Object.assign({
			blendFunction: BlendFunction.NORMAL,
			adaptive: true,
			resolution: 256,
			distinction: 1.0,
			middleGrey: 0.6,
			maxLuminance: 16.0,
			averageLuminance: 1.0,
			adaptationRate: 2.0
		}, options);

		super("ToneMappingEffect", fragment, {

			blendFunction: settings.blendFunction,

			uniforms: new Map([
				["luminanceMap", new Uniform(null)],
				["middleGrey", new Uniform(settings.middleGrey)],
				["maxLuminance", new Uniform(settings.maxLuminance)],
				["averageLuminance", new Uniform(settings.averageLuminance)]
			])

		});

		/**
		 * The render target for the current luminance.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 * @todo Use RED format in WebGL 2.0.
		 */

		this.renderTargetLuminance = new WebGLRenderTarget(1, 1, {
			minFilter: LinearMipMapLinearFilter,
			magFilter: LinearFilter,
			format: RGBFormat,
			stencilBuffer: false,
			depthBuffer: false
		});

		this.renderTargetLuminance.texture.name = "ToneMapping.Luminance";

		/**
		 * The render target for adapted luminance.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetAdapted = this.renderTargetLuminance.clone();

		this.renderTargetAdapted.texture.name = "ToneMapping.AdaptedLuminance";
		this.renderTargetAdapted.texture.generateMipmaps = false;
		this.renderTargetAdapted.texture.minFilter = LinearFilter;

		/**
		 * A render target that holds a copy of the adapted luminance.
		 *
		 * @type {WebGLRenderTarget}
		 * @private
		 */

		this.renderTargetPrevious = this.renderTargetAdapted.clone();

		this.renderTargetPrevious.texture.name = "ToneMapping.PreviousLuminance";

		/**
		 * A save pass.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.savePass = new SavePass(this.renderTargetPrevious, false);

		/**
		 * A luminance shader pass.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.luminancePass = new ShaderPass(new LuminanceMaterial());

		/**
		 * An adaptive luminance shader pass.
		 *
		 * @type {ShaderPass}
		 * @private
		 */

		this.adaptiveLuminancePass = new ShaderPass(new AdaptiveLuminanceMaterial());

		// Apply settings.
		this.adaptationRate = settings.adaptationRate;
		this.distinction = settings.distinction;
		this.resolution = settings.resolution;
		this.adaptive = settings.adaptive;

	}

	/**
	 * The resolution of the render targets.
	 *
	 * @type {Number}
	 */

	get resolution() {

		return this.renderTargetLuminance.width;

	}

	/**
	 * Sets the resolution of the internal render targets.
	 *
	 * You'll need to call {@link EffectPass#recompile} after changing this value.
	 *
	 * @type {Number}
	 */

	set resolution(value) {

		// Round the given value to the next power of two.
		const exponent = Math.max(0, Math.ceil(Math.log2(value)));
		value = Math.pow(2, exponent);

		this.renderTargetLuminance.setSize(value, value);
		this.renderTargetPrevious.setSize(value, value);
		this.renderTargetAdapted.setSize(value, value);

		this.adaptiveLuminancePass.getFullscreenMaterial().defines.MIP_LEVEL_1X1 = exponent.toFixed(1);

	}

	/**
	 * Indicates whether this pass uses adaptive luminance.
	 *
	 * @type {Boolean}
	 */

	get adaptive() {

		return this.defines.has("ADAPTED_LUMINANCE");

	}

	/**
	 * Enables or disables adaptive luminance.
	 *
	 * You'll need to call {@link EffectPass#recompile} after changing this value.
	 *
	 * @type {Boolean}
	 */

	set adaptive(value) {

		if(value) {

			this.defines.set("ADAPTED_LUMINANCE", "1");
			this.uniforms.get("luminanceMap").value = this.renderTargetAdapted.texture;

		} else {

			this.defines.delete("ADAPTED_LUMINANCE");
			this.uniforms.get("luminanceMap").value = null;

		}

	}

	/**
	 * The luminance adaptation rate.
	 *
	 * @type {Number}
	 */

	get adaptationRate() {

		return this.adaptiveLuminancePass.getFullscreenMaterial().uniforms.tau.value;

	}

	/**
	 * @type {Number}
	 */

	set adaptationRate(value) {

		this.adaptiveLuminancePass.getFullscreenMaterial().uniforms.tau.value = value;

	}

	/**
	 * The luminance distinction factor.
	 *
	 * @type {Number}
	 */

	get distinction() {

		return this.luminancePass.getFullscreenMaterial().uniforms.distinction.value;

	}

	/**
	 * @type {Number}
	 */

	set distinction(value = 1.0) {

		this.luminancePass.getFullscreenMaterial().uniforms.distinction.value = value;

	}

	/**
	 * Updates this effect.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {WebGLRenderTarget} inputBuffer - A frame buffer that contains the result of the previous pass.
	 * @param {Number} [delta] - The time between the last frame and the current one in seconds.
	 */

	update(renderer, inputBuffer, delta) {

		if(this.adaptive) {

			// Render the luminance of the current scene into a mipmap render target.
			this.luminancePass.render(renderer, inputBuffer, this.renderTargetLuminance);

			// Use the frame delta to adapt the luminance over time.
			const uniforms = this.adaptiveLuminancePass.getFullscreenMaterial().uniforms;
			uniforms.previousLuminanceBuffer.value = this.renderTargetPrevious.texture;
			uniforms.currentLuminanceBuffer.value = this.renderTargetLuminance.texture;
			uniforms.delta.value = delta;
			this.adaptiveLuminancePass.render(renderer, null, this.renderTargetAdapted);

			// Save the adapted luminance for the next frame.
			this.savePass.render(renderer, this.renderTargetAdapted);

		}

	}

	/**
	 * Updates the size of internal render targets.
	 *
	 * @param {Number} width - The width.
	 * @param {Number} height - The height.
	 */

	setSize(width, height) {

		this.savePass.setSize(width, height);

	}

	/**
	 * Performs initialization tasks.
	 *
	 * @param {WebGLRenderer} renderer - The renderer.
	 * @param {Boolean} alpha - Whether the renderer uses the alpha channel or not.
	 */

	initialize(renderer, alpha) {

		const clearPass = new ClearPass({ clearColor: new Color(0x7fffff) });
		clearPass.render(renderer, this.renderTargetPrevious);
		clearPass.dispose();

	}

}
