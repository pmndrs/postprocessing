import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/color-burn.frag";

/**
 * Color burn.
 *
 * @group Blending
 */

export class ColorBurnBlendFunction extends BlendFunction {

	/**
	 * Constructs a new color burn blend function.
	 */

	constructor() {

		super(shader);

	}

}
