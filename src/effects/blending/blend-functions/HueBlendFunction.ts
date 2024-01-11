import { BlendFunction } from "../BlendFunction.js";

import shader from "./shaders/hue.frag";

/**
 * Converts the colors to HSL and blends based on hue.
 *
 * @category Blending
 */

export class HueBlendFunction extends BlendFunction {

	/**
	 * Constructs a new hue blend function.
	 */

	constructor() {

		super("hue", shader);

	}

}
