import { Uniform } from "three";
import { EffectAttribute } from "../enums";
import { Effect } from "./Effect";

import fragmentShader from "./glsl/tiltshift.frag";

/**
 * A tilt shift effect.
 *
 * Original shader code by Evan Wallace:
 * https://evanw.github.io/glfx.js/demo/#tiltShift
 *
 */

export class TiltShiftEffect extends Effect {

	/**
   * Constructs a new Tilt Shift Effect
   *
   * @param {Object} [options] - The options.
   * @param {BlendFunction} [options.blendFunction] - The blend function of this effect.
   * @param {Number} [options.blurRadius=10.0] - The size of the blur, greater than 0
   * @param {Number} [options.gradientRadius=200.0] - The falloff size of the tilt shift effect
   * @param {Number} [options.start=[.01, .01]] - The x,y of the starting point in percent (%) of the render target size
   * @param {Number} [options.end=[1.0, 1.0]] - The x,y of the ending point, in percent (%) of the render target size
   * @param {Number} [options.delta=[1, 1]] - A vector for the blur direction
   * @param {Number} [options.sampleCount=40.0] - The number of iterations for triangular blur
   */

	constructor({
		blendFunction,
		blurRadius = 10.0,
		gradientRadius = 200.0,
		start = [.01, .01],
		end = [1.0, 1.0],
		delta = [1, 1],
		sampleCount = 40.0
	} = {}) {

		super("TiltShiftEffect", fragmentShader, {
			blendFunction,
			attributes: EffectAttribute.CONVOLUTION,
			uniforms: new Map([
				["blurRadius", new Uniform(blurRadius)],
				["gradientRadius", new Uniform(gradientRadius)],
				["start", new Uniform(start)],
				["end", new Uniform(end)],
				["delta", new Uniform(delta)],
				["sampleCount", new Uniform(sampleCount)]
			])
		});

	}

}
