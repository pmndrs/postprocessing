import { Uniform } from "three";
import { BlendFunction } from "./blending/BlendFunction.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/gamma-correction/shader.frag";

/**
 * A gamma correction effect.
 *
 * @deprecated Set WebGLRenderer.outputEncoding to sRGBEncoding or GammaEncoding instead.
 */

export class GammaCorrectionEffect extends Effect {

	/**
	 * Constructs a new gamma correction effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
	 * @param {Number} [options.gamma=2.0] - The gamma factor.
	 */

	constructor({ blendFunction = BlendFunction.NORMAL, gamma = 2.0 } = {}) {

		super("GammaCorrectionEffect", fragmentShader, {

			blendFunction,

			uniforms: new Map([
				["gamma", new Uniform(gamma)]
			])

		});

	}

}
