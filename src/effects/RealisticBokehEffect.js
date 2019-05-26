import { Uniform, Vector4 } from "three";
import { BlendFunction } from "./blending/BlendFunction.js";
import { Effect, EffectAttribute } from "./Effect.js";

import fragmentShader from "./glsl/realistic-bokeh/shader.frag";

/**
 * Depth of Field shader v2.4.
 *
 * Yields more realistic results but is also more demanding.
 *
 * Original shader code by Martins Upitis:
 *  http://blenderartists.org/forum/showthread.php?237488-GLSL-depth-of-field-with-bokeh-v2-4-(update)
 */

export class RealisticBokehEffect extends Effect {

	/**
	 * Constructs a new bokeh effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
	 * @param {Number} [options.focus=1.0] - The focus distance in world units.
	 * @param {Number} [options.focalLength=24.0] - The focal length of the main camera.
	 * @param {Number} [options.luminanceThreshold=0.5] - A luminance threshold.
	 * @param {Number} [options.luminanceGain=2.0] - A luminance gain factor.
	 * @param {Number} [options.bias=0.5] - A blur bias.
	 * @param {Number} [options.fringe=0.7] - A blur offset.
	 * @param {Number} [options.maxBlur=1.0] - The maximum blur strength.
	 * @param {Boolean} [options.rings=3] - The number of blur iterations.
	 * @param {Boolean} [options.samples=2] - The amount of samples taken per ring.
	 * @param {Boolean} [options.showFocus=false] - Whether the focal point should be highlighted. Useful for debugging.
	 * @param {Boolean} [options.manualDoF=false] - Enables manual control over the depth of field.
	 * @param {Boolean} [options.pentagon=false] - Enables pentagonal blur shapes. Requires a high number of rings and samples.
	 */

	constructor({
		blendFunction = BlendFunction.NORMAL,
		focus = 1.0,
		focalLength = 24.0,
		luminanceThreshold = 0.5,
		luminanceGain = 2.0,
		bias = 0.5,
		fringe = 0.7,
		maxBlur = 1.0,
		rings = 3,
		samples = 2,
		showFocus = false,
		manualDoF = false,
		pentagon = false
	} = {}) {

		super("RealisticBokehEffect", fragmentShader, {

			blendFunction,
			attributes: EffectAttribute.CONVOLUTION | EffectAttribute.DEPTH,

			uniforms: new Map([
				["focus", new Uniform(focus)],
				["focalLength", new Uniform(focalLength)],
				["luminanceThreshold", new Uniform(luminanceThreshold)],
				["luminanceGain", new Uniform(luminanceGain)],
				["bias", new Uniform(bias)],
				["fringe", new Uniform(fringe)],
				["maxBlur", new Uniform(maxBlur)]
			])

		});

		this.rings = rings;
		this.samples = samples;
		this.showFocus = showFocus;
		this.manualDoF = manualDoF;
		this.pentagon = pentagon;

	}

	/**
	 * The amount of blur iterations.
	 *
	 * @type {Number}
	 */

	get rings() {

		return Number.parseInt(this.defines.get("RINGS_INT"));

	}

	/**
	 * Sets the amount of blur iterations.
	 *
	 * You'll need to call {@link EffectPass#recompile} after changing this value.
	 *
	 * @type {Number}
	 */

	set rings(value) {

		value = Math.floor(value);

		this.defines.set("RINGS_INT", value.toFixed(0));
		this.defines.set("RINGS_FLOAT", value.toFixed(1));

	}

	/**
	 * The amount of blur samples per ring.
	 *
	 * @type {Number}
	 */

	get samples() {

		return Number.parseInt(this.defines.get("SAMPLES_INT"));

	}

	/**
	 * Sets the amount of blur samples per ring.
	 *
	 * You'll need to call {@link EffectPass#recompile} after changing this value.
	 *
	 * @type {Number}
	 */

	set samples(value) {

		value = Math.floor(value);

		this.defines.set("SAMPLES_INT", value.toFixed(0));
		this.defines.set("SAMPLES_FLOAT", value.toFixed(1));

	}

	/**
	 * Indicates whether the focal point will be highlighted.
	 *
	 * @type {Boolean}
	 */

	get showFocus() {

		return this.defines.has("SHOW_FOCUS");

	}

	/**
	 * Enables or disables focal point highlighting.
	 *
	 * You'll need to call {@link EffectPass#recompile} after changing this value.
	 *
	 * @type {Boolean}
	 */

	set showFocus(value) {

		value ? this.defines.set("SHOW_FOCUS", "1") : this.defines.delete("SHOW_FOCUS");

	}

	/**
	 * Indicates whether the Depth of Field should be calculated manually.
	 *
	 * If enabled, the Depth of Field can be adjusted via the `dof` uniform.
	 *
	 * @type {Boolean}
	 */

	get manualDoF() {

		return this.defines.has("MANUAL_DOF");

	}

	/**
	 * Enables or disables manual Depth of Field.
	 *
	 * You'll need to call {@link EffectPass#recompile} after changing this value.
	 *
	 * @type {Boolean}
	 */

	set manualDoF(value) {

		if(value) {

			this.defines.set("MANUAL_DOF", "1");
			this.uniforms.set("dof", new Uniform(new Vector4(0.2, 1.0, 0.2, 2.0)));

		} else {

			this.defines.delete("MANUAL_DOF");
			this.uniforms.delete("dof");

		}

	}

	/**
	 * Indicates whether the blur shape should be pentagonal.
	 *
	 * @type {Boolean}
	 */

	get pentagon() {

		return this.defines.has("PENTAGON");

	}

	/**
	 * Enables or disables pentagonal blur.
	 *
	 * You'll need to call {@link EffectPass#recompile} after changing this value.
	 *
	 * @type {Boolean}
	 */

	set pentagon(value) {

		value ? this.defines.set("PENTAGON", "1") : this.defines.delete("PENTAGON");

	}

}
