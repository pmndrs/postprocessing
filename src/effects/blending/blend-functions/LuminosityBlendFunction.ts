import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/luminosity.frag";

/**
 * Converts the colors to HSL and blends based on luminosity.
 *
 * @group Blending
 */

export class LuminosityBlendFunction extends BlendFunction {

	/**
	 * Constructs a new luminosity blend function.
	 */

	constructor() {

		super(shader);

	}

}
