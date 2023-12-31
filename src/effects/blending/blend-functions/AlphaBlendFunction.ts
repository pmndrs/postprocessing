import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/alpha.frag";

/**
 * Blends based on the alpha value of the new color. Supports HDR.
 *
 * @group Blending
 */

export class AlphaBlendFunction extends BlendFunction {

	/**
	 * Constructs a new alpha blend function.
	 */

	constructor() {

		super("alpha", shader, true);

	}

}
