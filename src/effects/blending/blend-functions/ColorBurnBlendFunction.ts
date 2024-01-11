import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/color-burn.frag";

/**
 * Color burn.
 *
 * @category Blending
 */

export class ColorBurnBlendFunction extends BlendFunction {

	/**
	 * Constructs a new color burn blend function.
	 */

	constructor() {

		super("color-burn", shader);

	}

}
