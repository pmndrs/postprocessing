import { Uniform } from "three";
import { BlendFunction } from "./blending/BlendFunction.js";
import { Effect, EffectAttribute } from "./Effect.js";

import fragment from "./glsl/bokeh/shader.frag";

/**
 * A depth of field (bokeh) shader effect.
 *
 * Original shader code by Martins Upitis:
 *  http://artmartinsh.blogspot.com/2010/02/glsl-lens-blur-filter-with-bokeh.html
 */

export class BokehEffect extends Effect {

	/**
	 * Constructs a new bokeh effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.focus=0.5] - The focus distance ratio, ranging from 0.0 to 1.0.
	 * @param {Number} [options.dof=0.02] - Depth of field. An area in front of and behind the focus point that still appears sharp.
	 * @param {Number} [options.aperture=0.025] - Camera aperture scale. Bigger values for stronger blur and shallower depth of field.
	 * @param {Number} [options.maxBlur=1.0] - The maximum blur strength.
	 */

	constructor(options = {}) {

		const settings = Object.assign({
			focus: 0.5,
			dof: 0.02,
			aperture: 0.025,
			maxBlur: 1.0
		}, options);

		super("BokehEffect", fragment, {

			attributes: EffectAttribute.CONVOLUTION | EffectAttribute.DEPTH,
			blendFunction: BlendFunction.NORMAL,

			uniforms: new Map([
				["focus", new Uniform(settings.focus)],
				["dof", new Uniform(settings.dof)],
				["aperture", new Uniform(settings.aperture)],
				["maxBlur", new Uniform(settings.maxBlur)]
			])

		});

	}

}
