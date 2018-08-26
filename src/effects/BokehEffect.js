import { Uniform } from "three";
import { Effect, EffectType } from "./Effect.js";
import { BlendFunction } from "./blending/BlendFunction.js";

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
	 * @param {PerspectiveCamera} [camera] - A camera.
	 * @param {Object} [options] - The options.
	 * @param {Number} [options.focus=1.0] - The focus distance, corresponds directly with the scene depth.
	 * @param {Number} [options.dof=0.02] - Depth of field. An area in front of and behind the focus point that still appears sharp.
	 * @param {Number} [options.aperture=0.025] - Camera aperture scale. Bigger values for stronger blur and shallower depth of field.
	 * @param {Number} [options.maxBlur=1.0] - The maximum blur strength.
	 */

	constructor(camera, options = {}) {

		const settings = Object.assign({
			focus: 1.0,
			dof: 0.02,
			aperture: 0.025,
			maxBlur: 1.0
		}, options);

		super("BokehEffect", fragment, {

			type: EffectType.CONVOLUTION,
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
