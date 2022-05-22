import { BlendFunction } from "../enums";
import { Effect } from "./Effect";

import fragmentShader from "./glsl/color-average/shader.frag";

/**
 * A fast greyscale effect.
 */

export class ColorAverageEffect extends Effect {

	/**
	 * Constructs a new color average effect.
	 *
	 * @param {BlendFunction} [blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
	 */

	constructor(blendFunction = BlendFunction.NORMAL) {

		super("ColorAverageEffect", fragmentShader, { blendFunction });

	}

}
