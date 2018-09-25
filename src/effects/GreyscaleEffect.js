import { BlendFunction } from "./blending/BlendFunction.js";
import { Effect } from "./Effect.js";

import fragment from "./glsl/greyscale/shader.frag";

/**
 * A greyscale effect.
 */

export class GreyscaleEffect extends Effect {

	/**
	 * Constructs a new greyscale effect.
	 *
	 * @param {BlendFunction} [blendFunction=BlendFunction.NORMAL] - The blend function of this effect.
	 */

	constructor(blendFunction = BlendFunction.NORMAL) {

		super("GreyscaleEffect", fragment, { blendFunction });

	}

}
