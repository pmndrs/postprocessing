import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/luminosity.frag";

/**
 * Converts the colors to HSL and blends based on luminosity.
 *
 * @category Blending
 */

export class LuminosityBlendFunction extends BlendFunction {

	/**
	 * Constructs a new luminosity blend function.
	 */

	constructor() {

		super("luminosity", shader);

	}

}
