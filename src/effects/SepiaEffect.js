import { Uniform } from "three";
import { BlendFunction } from "./blending/BlendFunction.js";
import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/sepia/shader.frag";

/**
 * A sepia effect.
 */

export class SepiaEffect extends Effect {

	/**
	 * Constructs a new sepia effect.
	 *
	 * @param {Object} [options] - The options.
	 * @param {BlendFunction} [options.blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
	 * @param {Number} [options.intensity=1.0] - The intensity of the effect.
	 */

	constructor({ blendFunction = BlendFunction.NORMAL, intensity = 1.0 } = {}) {

		super("SepiaEffect", fragmentShader, {

			blendFunction,

			uniforms: new Map([
				["intensity", new Uniform(intensity)]
			])

		});

	}

}
