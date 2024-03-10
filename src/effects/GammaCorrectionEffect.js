import { Uniform } from "three";
import { BlendFunction } from "../enums/BlendFunction.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/gamma-correction.frag";

/**
 * A gamma correction effect.
 *
 * @deprecated Set WebGLRenderer.outputEncoding to sRGBEncoding instead.
 */

export class GammaCorrectionEffect extends Effect {

	/**
	 * Constructs a new gamma correction effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.SRC] - The blend function of this effect.
	 * @param {Number} [options.gamma=2.0] - The gamma factor.
	 */

	constructor({ blendFunction = BlendFunction.SRC, gamma = 2.0 } = {}) {

		super("GammaCorrectionEffect", fragmentShader, {
			blendFunction,
			uniforms: new Map([
				["gamma", new Uniform(gamma)]
			])
		});

	}

}
