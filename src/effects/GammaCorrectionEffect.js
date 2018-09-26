import { Uniform } from "three";
import { BlendFunction } from "./blending/BlendFunction.js";
import { Effect } from "./Effect.js";

import fragment from "./glsl/gamma-correction/shader.frag";

/**
 * A gamma correction effect.
 */

export class GammaCorrectionEffect extends Effect {

	/**
	 * Constructs a new gamma correction effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
	 * @param {Number} [options.gamma=2.0] - The gamma factor.
	 */

	constructor(options = {}) {

		const settings = Object.assign({
			blendFunction: BlendFunction.NORMAL,
			gamma: 2.0
		}, options);

		super("GammaCorrectionEffect", fragment, {

			blendFunction: settings.blendFunction,

			uniforms: new Map([
				["gamma", new Uniform(settings.gamma)]
			])

		});

	}

}
