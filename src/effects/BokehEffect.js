import { Uniform } from "three";
import { EffectAttribute } from "../enums/EffectAttribute.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/bokeh.frag";

/**
 * A depth of field (bokeh) effect.
 *
 * Original shader code by Martins Upitis:
 * http://artmartinsh.blogspot.com/2010/02/glsl-lens-blur-filter-with-bokeh.html
 *
 * @deprecated Use DepthOfFieldEffect instead.
 */

export class BokehEffect extends Effect {

	/**
	 * Constructs a new bokeh effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction] - The blend function of this effect.
	 * @param {Number} [options.focus=0.5] - The focus distance ratio, ranging from 0.0 to 1.0.
	 * @param {Number} [options.dof=0.02] - Depth of field. An area in front of and behind the focal point that still appears sharp.
	 * @param {Number} [options.aperture=0.015] - Camera aperture scale. Bigger values for stronger blur and shallower depth of field.
	 * @param {Number} [options.maxBlur=1.0] - The maximum blur strength.
	 */

	constructor({
		blendFunction,
		focus = 0.5,
		dof = 0.02,
		aperture = 0.015,
		maxBlur = 1.0
	} = {}) {

		super("BokehEffect", fragmentShader, {
			blendFunction,
			attributes: EffectAttribute.CONVOLUTION | EffectAttribute.DEPTH,
			uniforms: new Map([
				["focus", new Uniform(focus)],
				["dof", new Uniform(dof)],
				["aperture", new Uniform(aperture)],
				["maxBlur", new Uniform(maxBlur)]
			])
		});

	}

}
