import { Effect } from "./Effect.js";

import fragmentShader from "./glsl/color-average.frag";

/**
 * A fast greyscale effect.
 */

export class ColorAverageEffect extends Effect {

	/**
	 * Constructs a new color average effect.
	 *
	 * @param {BlendFunction} [blendFunction] - The blend function of this effect.
	 */

	constructor(blendFunction) {

		super("ColorAverageEffect", fragmentShader, { blendFunction });

	}

}
