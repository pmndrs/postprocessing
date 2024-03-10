import { Uniform, Vector4 } from "three";
import { EffectAttribute } from "../enums/EffectAttribute.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/realistic-bokeh.frag";

/**
 * Depth of Field shader v2.4.
 *
 * Yields more realistic results but is also more demanding.
 *
 * Original shader code by Martins Upitis:
 * http://blenderartists.org/forum/showthread.php?237488-GLSL-depth-of-field-with-bokeh-v2-4-(update)
 *
 * @deprecated Use DepthOfFieldEffect instead.
 */

export class RealisticBokehEffect extends Effect {

	/**
	 * Constructs a new bokeh effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction] - The blend function of this effect.
	 * @param {Number} [options.focus=1.0] - The focus distance in world units.
	 * @param {Number} [options.focalLength=24.0] - The focal length of the main camera.
	 * @param {Number} [options.fStop=0.9] - The ratio of the lens focal length to the diameter of the entrance pupil (aperture).
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
		blendFunction,
		focus = 1.0,
		focalLength = 24.0,
		fStop = 0.9,
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
				["fStop", new Uniform(fStop)],
				["luminanceThreshold", new Uniform(luminanceThreshold)],
				["luminanceGain", new Uniform(luminanceGain)],
				["bias", new Uniform(bias)],
				["fringe", new Uniform(fringe)],
				["maxBlur", new Uniform(maxBlur)],
				["dof", new Uniform(null)]
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

	set rings(value) {

		const r = Math.floor(value);
		this.defines.set("RINGS_INT", r.toFixed(0));
		this.defines.set("RINGS_FLOAT", r.toFixed(1));

		this.setChanged();

	}

	/**
	 * The amount of blur samples per ring.
	 *
	 * @type {Number}
	 */

	get samples() {

		return Number.parseInt(this.defines.get("SAMPLES_INT"));

	}

	set samples(value) {

		const s = Math.floor(value);
		this.defines.set("SAMPLES_INT", s.toFixed(0));
		this.defines.set("SAMPLES_FLOAT", s.toFixed(1));

		this.setChanged();

	}

	/**
	 * Indicates whether the focal point will be highlighted.
	 *
	 * @type {Boolean}
	 */

	get showFocus() {

		return this.defines.has("SHOW_FOCUS");

	}

	set showFocus(value) {

		if(this.showFocus !== value) {

			if(value) {

				this.defines.set("SHOW_FOCUS", "1");

			} else {

				this.defines.delete("SHOW_FOCUS");

			}

			this.setChanged();

		}

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

	set manualDoF(value) {

		if(this.manualDoF !== value) {

			if(value) {

				this.defines.set("MANUAL_DOF", "1");
				this.uniforms.get("dof").value = new Vector4(0.2, 1.0, 0.2, 2.0);

			} else {

				this.defines.delete("MANUAL_DOF");
				this.uniforms.get("dof").value = null;

			}

			this.setChanged();

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

	set pentagon(value) {

		if(this.pentagon !== value) {

			if(value) {

				this.defines.set("PENTAGON", "1");

			} else {

				this.defines.delete("PENTAGON");

			}

			this.setChanged();

		}

	}

}
