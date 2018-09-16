import { Uniform } from "three";
import { BlendFunction } from "./blending/BlendFunction.js";
import { Effect, EffectAttribute } from "./Effect.js";

import fragment from "./glsl/bokeh/shader.frag";

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
	 * @param {PerspectiveCamera} [camera] - A camera.
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.focus=0.5] - The focus distance ratio, ranging from 0.0 to 1.0.
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

	constructor(camera, options = {}) {

		const settings = Object.assign({
			focus: 0.5,
			focalLength: 24.0,
			luminanceThreshold: 0.5,
			luminanceGain: 2.0,
			bias: 0.5,
			fringe: 0.7,
			maxBlur: 1.0,
			rings: 3,
			samples: 2,
			showFocus: false,
			manualDoF: false,
			pentagon: false
		}, options);

		super("RealisticBokehEffect", fragment, {

			attributes: EffectAttribute.CONVOLUTION | EffectAttribute.DEPTH,
			blendFunction: BlendFunction.NORMAL,

			defines: new Map([
				["RINGS_INT", new Uniform(settings.rings.toFixed(0))],
				["RINGS_FLOAT", new Uniform(settings.rings.toFixed(1))],
				["SAMPLES_INT", new Uniform(settings.samples.toFixed(0))],
				["SAMPLES_FLOAT", new Uniform(settings.samples.toFixed(1))]
			]),

			uniforms: new Map([
				["focus", new Uniform(settings.focus)],
				["focalLength", new Uniform(settings.focalLength)],
				["luminanceThreshold", new Uniform(settings.luminanceThreshold)],
				["luminanceGain", new Uniform(settings.luminanceGain)],
				["bias", new Uniform(settings.bias)],
				["fringe", new Uniform(settings.fringe)],
				["maxBlur", new Uniform(settings.maxBlur)]
			])

		});

		this.showFocus = settings.showFocus;
		this.manualDoF = settings.manualDoF;
		this.pentagon = settings.pentagon;

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

		value ? this.defines.set("MANUAL_DOF", "1") : this.defines.delete("MANUAL_DOF");

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
