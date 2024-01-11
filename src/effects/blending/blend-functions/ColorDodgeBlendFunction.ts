import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/color-dodge.frag";

/**
 * Color dodge.
 *
 * @category Blending
 */

export class ColorDodgeBlendFunction extends BlendFunction {

	/**
	 * Constructs a new color dodge blend function.
	 */

	constructor() {

		super("color-dodge", shader);

	}

}
