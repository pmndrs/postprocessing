import { BlendFunction } from "./blending/BlendFunction.js";
import { Effect } from "./Effect.js";

import fragment from "./glsl/color-average/shader.frag";

/**
 * A color average effect.
 */

export class ColorAverageEffect extends Effect {

	/**
	 * Constructs a new color average effect.
	 *
	 * @param {BlendFunction} [blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
	 */

	constructor(blendFunction = BlendFunction.NORMAL) {

		super("ColorAverageEffect", fragment, { blendFunction });

	}

}
